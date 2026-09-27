import { GOALS } from "@/config/goals";
import type { Serve, SessionStats, SessionSummary, Spin, SpinStats } from "./types";

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const round1 = (x: number | null) => (x === null ? null : Math.round(x * 10) / 10);

export function spinStats(serves: Serve[]): SpinStats {
  const clean = serves.filter((s) => !s.suspect);
  const ins = serves.filter((s) => s.result === "in");
  const outs = serves.filter((s) => s.result === "out");
  const bogus = serves.filter((s) => s.suspect).map((s) => s.speed);
  return {
    total: serves.length,
    in: ins.length,
    out: outs.length,
    net: serves.filter((s) => s.result === "net").length,
    long: outs.filter((s) => s.deep).length,
    wide: outs.filter((s) => !s.deep).length,
    inPct: serves.length ? round1((100 * ins.length) / serves.length) : null,
    avgSpeedIn: round1(mean(clean.filter((s) => s.result === "in").map((s) => s.speed))),
    avgSpeed: round1(mean(clean.map((s) => s.speed))),
    maxSpeed: clean.length ? round1(Math.max(...clean.map((s) => s.speed))) : null,
    suspect: bogus.length,
    bogusTop: bogus.length ? round1(Math.max(...bogus)) : null,
  };
}

export function sessionStats(serves: Serve[]): SessionStats {
  return {
    flat: spinStats(serves.filter((s) => s.spin === "flat")),
    slice: spinStats(serves.filter((s) => s.spin === "slice")),
    kick: spinStats(serves.filter((s) => s.spin === "kick")),
    total: spinStats(serves),
  };
}

// Доля пути до цели, 0..1 (может быть > 1, если вдруг случилось чудо).
export function progress(current: number | null, goal: number): number {
  return current === null ? 0 : current / goal;
}

export interface Forecast {
  spin: Spin;
  // null — тренд не растёт, цель недостижима «при текущем темпе»
  date: Date | null;
  reached: boolean;
  confident: boolean; // хватает ли точек, чтобы верить прогнозу хоть немного
  speedPerWeek: number | null;
}

const DAY = 86_400_000;

function linearFit(points: { x: number; y: number }[]) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

// Когда линия тренда пересечёт цель. Для каждой из двух метрик — отдельно,
// итоговая дата — поздняя из двух.
function crossing(points: { x: number; y: number }[], goal: number, now: number): number | null | "reached" {
  if (points.length < 2) return null;
  const { slope, intercept } = linearFit(points);
  const current = intercept + slope * now;
  if (current >= goal) return "reached";
  if (slope <= 0) return null;
  return (goal - intercept) / slope;
}

export function forecast(sessions: SessionSummary[], spin: Spin): Forecast {
  const goal = GOALS[spin];
  const t = (d: string) => new Date(d + "T00:00:00Z").getTime() / DAY;
  const speedPts = sessions
    .filter((s) => s.stats[spin].avgSpeedIn !== null)
    .map((s) => ({ x: t(s.date), y: s.stats[spin].avgSpeedIn! }));
  const pctPts = sessions
    .filter((s) => s.stats[spin].inPct !== null)
    .map((s) => ({ x: t(s.date), y: s.stats[spin].inPct! }));
  const now = Math.max(...sessions.map((s) => t(s.date)));

  const a = crossing(speedPts, goal.speed, now);
  const b = crossing(pctPts, goal.inPct, now);
  const speedPerWeek = speedPts.length >= 2 ? linearFit(speedPts).slope * 7 : null;
  const base = {
    spin,
    confident: Math.min(speedPts.length, pctPts.length) >= 4,
    speedPerWeek: round1(speedPerWeek),
  };

  if (a === "reached" && b === "reached") return { ...base, date: null, reached: true };
  if (a === null || b === null) return { ...base, date: null, reached: false };
  const days = Math.max(a === "reached" ? now : a, b === "reached" ? now : b);
  return { ...base, date: new Date(days * DAY), reached: false };
}

export function poolStats(serveGroups: Serve[][]): SessionStats {
  return sessionStats(serveGroups.flat());
}
