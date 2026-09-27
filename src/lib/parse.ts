import ExcelJS from "exceljs";
import { z } from "zod";
import type { Serve, ServeResult, Spin } from "./types";

// Экспорт SwingVision: листы Settings / Shots / Rallies. Нам нужен Shots.
const ShotRow = z.object({
  Type: z.string(),
  Stroke: z.string(),
  Spin: z.string(),
  "Speed (MPH)": z.coerce.number(),
  Result: z.string(),
  "Bounce Depth": z.string(),
  "Bounce (x)": z.coerce.number(),
  "Bounce (y)": z.coerce.number(),
  "Hit Zone": z.string(),
  Direction: z.string().catch(""),
  "Video Time": z.coerce.number().catch(0),
});

const SPIN_MAP: Record<string, Spin> = { Flat: "flat", Slice: "slice", Kick: "kick" };
const RESULT_MAP: Record<string, ServeResult> = { In: "in", Out: "out", Net: "net" };

// Скорость выше медианы этого типа подачи в SUSPECT_RATIO раз считаем ошибкой
// распознавания (в сырых данных встречаются «кики» на 93 mph).
export const SUSPECT_RATIO = 1.35;

export interface ParsedSession {
  startTime: string | null;
  endTime: string | null;
  serves: Serve[];
  skipped: number; // строки, которые не подачи
}

function cellValue(v: ExcelJS.CellValue): unknown {
  if (v && typeof v === "object" && "result" in v) return v.result;
  if (v && typeof v === "object" && "richText" in v) return v.richText.map((t) => t.text).join("");
  return v;
}

function sheetRows(ws: ExcelJS.Worksheet): Record<string, unknown>[] {
  const header = (ws.getRow(1).values as ExcelJS.CellValue[]).map((v) => String(cellValue(v) ?? ""));
  const rows: Record<string, unknown>[] = [];
  ws.eachRow((row, n) => {
    if (n === 1) return;
    const values = row.values as ExcelJS.CellValue[];
    const obj: Record<string, unknown> = {};
    header.forEach((h, i) => {
      if (h) obj[h] = cellValue(values[i]);
    });
    rows.push(obj);
  });
  return rows;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function flagSuspects(serves: Serve[]): Serve[] {
  const medians = new Map<Spin, number>();
  for (const spin of ["flat", "slice", "kick"] as Spin[]) {
    const speeds = serves.filter((s) => s.spin === spin).map((s) => s.speed);
    if (speeds.length >= 5) medians.set(spin, median(speeds));
  }
  return serves.map((s) => {
    const m = medians.get(s.spin);
    return { ...s, suspect: m !== undefined && s.speed > m * SUSPECT_RATIO };
  });
}

export async function parseSwingVision(data: ArrayBuffer): Promise<ParsedSession> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(data);

  const shots = wb.getWorksheet("Shots");
  if (!shots) throw new Error("No “Shots” sheet in the file — is this really a SwingVision export?");

  const settings = wb.getWorksheet("Settings");
  const settingsRow = settings ? sheetRows(settings)[0] : undefined;

  const serves: Serve[] = [];
  let skipped = 0;
  for (const raw of sheetRows(shots)) {
    const parsed = ShotRow.safeParse(raw);
    if (!parsed.success) {
      if (serves.length === 0 && skipped === 0) {
        throw new Error(`Unrecognized Shots sheet format: ${parsed.error.issues[0]?.path.join(".")}`);
      }
      skipped++;
      continue;
    }
    const r = parsed.data;
    const spin = SPIN_MAP[r.Spin];
    const result = RESULT_MAP[r.Result];
    if (r.Type !== "serve" || r.Stroke !== "Serve" || !spin || !result || !(r["Speed (MPH)"] > 0)) {
      skipped++;
      continue;
    }
    serves.push({
      spin,
      speed: r["Speed (MPH)"],
      result,
      bounceX: r["Bounce (x)"],
      bounceY: r["Bounce (y)"],
      deep: r["Bounce Depth"] === "deep",
      direction: r.Direction,
      side: r["Hit Zone"] === "deuce" ? "deuce" : "ad",
      videoTime: r["Video Time"],
      suspect: false,
    });
  }
  if (serves.length === 0) throw new Error("No serves found in the file.");

  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    startTime: str(settingsRow?.["Start Time"]),
    endTime: str(settingsRow?.["End Time"]),
    serves: flagSuspects(serves),
    skipped,
  };
}

// «SwingVision-Serve Practice-2026-09-23 at 22.35.27.xlsx» → «2026-09-23»
export function dateFromFilename(name: string): string | null {
  return name.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}
