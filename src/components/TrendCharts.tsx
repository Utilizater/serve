"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtShortDate } from "@/lib/format";
import type { Spin } from "@/lib/types";

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  speed: Record<Spin, number | null>;
  pct: Record<Spin, number | null>;
}

const SERIES: { spin: Spin; label: string; color: string }[] = [
  { spin: "flat", label: "Flat", color: "var(--color-flat)" },
  { spin: "slice", label: "Slice", color: "var(--color-slice)" },
  { spin: "kick", label: "Kick", color: "var(--color-kick)" },
];


export function TrendCharts({ points, goals }: { points: TrendPoint[]; goals: Record<Spin, { speed: number; inPct: number }> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Chart title="Speed of serves in, mph" points={points} metric="speed" goals={goals} unit=" mph" />
      <Chart title="In %" points={points} metric="pct" goals={goals} unit="%" />
    </div>
  );
}

function Chart({
  title,
  points,
  metric,
  goals,
  unit,
}: {
  title: string;
  points: TrendPoint[];
  metric: "speed" | "pct";
  goals: Record<Spin, { speed: number; inPct: number }>;
  unit: string;
}) {
  const data = points.map((p) => ({ date: fmtShortDate(p.date), ...p[metric] }));
  const goalOf = (s: Spin) => (metric === "speed" ? goals[s].speed : goals[s].inPct);
  const maxGoal = Math.max(...SERIES.map((s) => goalOf(s.spin)));
  const minY = metric === "speed" ? 30 : 0;

  return (
    <figure className="card p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{title}</span>
        <span className="flex gap-3 text-xs text-muted">
          {SERIES.map((s) => (
            <span key={s.spin} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-muted" />
            goal
          </span>
        </span>
      </figcaption>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 44, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="rgb(255 255 255 / 0.06)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--color-muted)" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              domain={[minY, Math.ceil((maxGoal + 5) / 10) * 10]}
              stroke="var(--color-muted)"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            {SERIES.map((s) => (
              <ReferenceLine
                key={s.spin}
                y={goalOf(s.spin)}
                stroke={s.color}
                strokeOpacity={0.55}
                strokeDasharray="4 4"
                label={{ value: `${goalOf(s.spin)}`, position: "right", fill: "var(--color-muted)", fontSize: 11 }}
              />
            ))}
            <Tooltip
              cursor={{ stroke: "rgb(255 255 255 / 0.25)" }}
              contentStyle={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-line)",
                borderRadius: 10,
                color: "var(--color-text)",
                fontSize: 13,
              }}
              labelStyle={{ color: "var(--color-muted)" }}
              formatter={(v, name) => [`${Math.round(Number(v))}${unit}`, SERIES.find((s) => s.spin === name)?.label ?? name]}
            />
            {SERIES.map((s) => (
              <Line
                key={s.spin}
                dataKey={s.spin}
                name={s.spin}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)", fill: s.color }}
                activeDot={{ r: 6, stroke: "var(--color-surface)", strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
