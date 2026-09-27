"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { parseSwingVision } from "@/lib/parse";
import { setUtr } from "@/lib/profile";
import { upsertSession } from "@/lib/sessions";
import { sessionStats } from "@/lib/stats";
import { fetchThumbnail, isSwingVisionUrl } from "@/lib/swingvision";

export type UploadState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; date: string; serves: number; skipped: number; suspect: number };

function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Сравниваем хеши одинаковой длины, чтобы не подсказывать длину пароля по времени.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function uploadSession(_prev: UploadState, form: FormData): Promise<UploadState> {
  if (!passwordMatches(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800));
    return { status: "error", message: "Wrong password. Missed even here." };
  }

  const date = String(form.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { status: "error", message: "Pick the session date." };

  const videoUrl = String(form.get("videoUrl") ?? "").trim();
  if (!isSwingVisionUrl(videoUrl)) {
    return { status: "error", message: "The link should look like https://swing.vision/matches/…" };
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Attach the SwingVision .xlsx export." };

  let parsed;
  try {
    parsed = await parseSwingVision(await file.arrayBuffer());
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Couldn't read the file." };
  }

  const note = String(form.get("note") ?? "").trim() || null;
  const stats = sessionStats(parsed.serves);

  try {
    await upsertSession({
      date,
      videoUrl,
      videoThumb: await fetchThumbnail(videoUrl),
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      note,
      serves: parsed.serves,
      stats,
      uploadedAt: new Date(),
    });
  } catch (e) {
    console.error(e);
    return { status: "error", message: "The database didn't respond. Check MONGO_URI and Atlas network access." };
  }

  revalidatePath("/", "layout");
  return { status: "ok", date, serves: parsed.serves.length, skipped: parsed.skipped, suspect: stats.total.suspect };
}

export type UtrState = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; utr: number };

export async function updateUtr(_prev: UtrState, form: FormData): Promise<UtrState> {
  if (!passwordMatches(String(form.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800));
    return { status: "error", message: "Wrong password. Missed even here." };
  }

  const utr = Number(String(form.get("utr") ?? "").replace(",", "."));
  if (!Number.isFinite(utr) || utr < 1 || utr > 16.5) {
    return { status: "error", message: "UTR should be a number between 1.00 and 16.50." };
  }

  try {
    await setUtr(Math.round(utr * 100) / 100);
  } catch (e) {
    console.error(e);
    return { status: "error", message: "The database didn't respond. Check MONGO_URI and Atlas network access." };
  }

  revalidatePath("/", "layout");
  return { status: "ok", utr: Math.round(utr * 100) / 100 };
}
