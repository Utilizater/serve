import "server-only";
import { PLAYER } from "@/config/goals";
import { getDb } from "./db";

interface ProfileDoc {
  _id: "profile";
  utr: number;
  utrUpdatedAt: Date;
}

export interface Profile {
  utr: number;
  utrUpdatedAt: Date | null;
}

async function collection() {
  return (await getDb()).collection<ProfileDoc>("settings");
}

// UTR правится из админки; пока его не задали — берём значение из конфига.
export async function getProfile(): Promise<Profile> {
  const doc = await (await collection()).findOne({ _id: "profile" });
  return { utr: doc?.utr ?? PLAYER.utr, utrUpdatedAt: doc?.utrUpdatedAt ?? null };
}

export async function setUtr(utr: number): Promise<void> {
  await (await collection()).updateOne({ _id: "profile" }, { $set: { utr, utrUpdatedAt: new Date() } }, { upsert: true });
}

export const fmtUtr = (utr: number) => utr.toFixed(2);
