import { GOALS, SPIN_LABEL, SPINS } from "@/config/goals";
import { plural } from "@/lib/format";
import { pctGapQuip, speedGapQuip } from "@/lib/quips";
import type { Spin, SpinStats } from "@/lib/types";

const SPIN_BG: Record<Spin, string> = { flat: "bg-flat", slice: "bg-slice", kick: "bg-kick" };

export function GoalCard({ spin, current, start }: { spin: Spin; current: SpinStats; start: SpinStats | null }) {
  const goal = GOALS[spin];
  return (
    <article className="card flex flex-col gap-6 p-5 sm:p-6">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <span className={`size-3 rounded-full ${SPIN_BG[spin]}`} aria-hidden />
          {SPIN_LABEL[spin]}
        </h3>
        <span className="text-right text-xs text-muted">{goal.role}</span>
      </header>

      <Meter
        label="Speed of serves in"
        unit="mph"
        value={current.avgSpeedIn}
        goal={goal.speed}
        start={start?.avgSpeedIn ?? null}
        color={SPIN_BG[spin]}
        quip={(gap) => speedGapQuip(gap, SPINS.indexOf(spin))}
      />
      <Meter
        label="In %"
        unit="%"
        value={current.inPct}
        goal={goal.inPct}
        start={start?.inPct ?? null}
        color={SPIN_BG[spin]}
        quip={(gap, value) => pctGapQuip(gap, value, SPINS.indexOf(spin))}
      />

      <p className="mt-auto text-xs text-muted num">
        {current.total} {plural(current.total, "serve", "serves")} in sample · {current.net} net · {current.long} long · {current.wide} wide
      </p>
    </article>
  );
}

function Meter({
  label,
  unit,
  value,
  goal,
  start,
  color,
  quip,
}: {
  label: string;
  unit: string;
  value: number | null;
  goal: number;
  start: number | null;
  color: string;
  quip: (gap: number, value: number) => string;
}) {
  if (value === null) {
    return (
      <div>
        <p className="eyebrow">{label}</p>
        <p className="mt-2 text-sm text-muted">No data. Maybe for the best.</p>
      </div>
    );
  }
  const gap = Math.round(goal - value);
  const fill = Math.min(value / goal, 1) * 100;
  const startPos = start !== null ? Math.min(start / goal, 1) * 100 : null;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{label}</p>
        <p className="text-xs text-muted num">
          goal <span className="font-semibold text-text">{goal}{unit === "%" ? "%" : ` ${unit}`}</span>
        </p>
      </div>
      <p className="mt-1 font-display text-4xl font-black num">
        {Math.round(value)}
        <span className="ml-1 text-base font-medium text-muted">{unit}</span>
      </p>
      <div
        className="relative mt-3 h-2.5 rounded-full bg-white/10"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={value}
        aria-label={`${label}: ${Math.round(value)} of ${goal}`}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${fill}%` }} />
        {startPos !== null && (
          <div
            className="absolute -top-1 h-[18px] w-0.5 rounded bg-text/60"
            style={{ left: `${startPos}%` }}
            title={`Start: ${Math.round(start!)}`}
          />
        )}
      </div>
      <p className="mt-2 text-sm num">
        {gap > 0 ? (
          <>
            <span className="font-bold text-ball">{gap} {unit === "%" ? "pts" : unit}</span> to go.{" "}
          </>
        ) : null}
        <span className="text-muted">{quip(gap, value)}</span>
      </p>
    </div>
  );
}
