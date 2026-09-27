import type { SpinStats } from "./types";

// Детерминированный выбор фразы: одна и та же страница — одна и та же шутка.
function pick<T>(items: T[], seed: string | number): T {
  if (typeof seed === "number") return items[seed % items.length];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return items[Math.abs(h) % items.length];
}

export function speedGapQuip(gap: number, seed: string | number): string {
  if (gap <= 0) return "Goal reached. Someone please check the radar.";
  if (gap < 5) return "Almost there. The trick is not to think about it.";
  if (gap < 15) return pick(["I can see the goal from here. With binoculars.", "A little more and I get bragging rights in the locker room."], seed);
  if (gap < 25)
    return pick(
      ["Roughly the speed I chase the ball after a double fault.", "The gap between “I play tennis” and “I play tennis well”."],
      seed,
    );
  return pick(
    [
      "A bigger gap than my self-belief after two double faults in a row.",
      "At this speed the ball has time to reconsider.",
      "Add this gap to my serve and you get a serve I don't have.",
    ],
    seed,
  );
}

export function pctGapQuip(gap: number, pct: number, seed: string | number): string {
  const miss = 100 - pct;
  const every = miss > 0 ? Math.round(100 / miss) : Infinity;
  const fact = every <= 1 ? "Most of them miss. " : every <= 10 ? `One in ${every} misses. ` : "";
  if (gap <= 0) return fact + "Consistent. Suspiciously so.";
  if (gap < 5) return fact + "Close. The net is getting nervous.";
  if (gap < 15) return fact + pick(["Double faults are my form of charity.", "Returners have learned they can relax."], seed);
  return fact + pick(["The court is big. I'm still checking all of it.", "Opponents love my serve. I don't."], seed);
}

export function netQuip(net: number, total: number): string | null {
  if (total === 0 || net === 0) return null;
  const share = net / total;
  if (share >= 0.25) return "The net was my toughest opponent today. It won.";
  if (share >= 0.15) return "The net took its share, but nothing crazy.";
  return "The net barely got involved. Should pay it a visit.";
}

export function bogusQuip(speeds: number[]): string | null {
  if (speeds.length === 0) return null;
  const list = speeds.map((s) => Math.round(s));
  const text = list.length === 1 ? `${list[0]} mph` : `${list.slice(0, -1).join(", ")} and ${list.at(-1)} mph`;
  return `SwingVision clocked ${text}. We both know that didn't happen — excluded from the stats.`;
}

export function sessionQuip(total: SpinStats, date: string): string {
  const pct = total.inPct ?? 0;
  if (pct >= 75) return "A day I'll tell my grandkids about.";
  if (pct >= 65) return pick(["Not bad. Suspiciously not bad.", "Presentable, even."], date);
  if (pct >= 55) return pick(["Solidly mediocre. Like me.", "Every other one went in. That's something."], date);
  return pick(["The kind of session that makes you want to train harder. Or quit.", "Let's call it a warm-up."], date);
}

export function forecastQuip(confident: boolean): string {
  return confident
    ? "Linear regression over every session. The math believes in me more than I do."
    : "Too few data points — this is less a forecast than a horoscope.";
}
