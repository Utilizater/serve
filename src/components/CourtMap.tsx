"use client";

import { useState } from "react";
import type { Serve, Spin } from "@/lib/types";

// Координаты SwingVision в метрах: x — вправо от камеры (0 = центральная линия),
// y — от ближней задней линии в сторону дальней половины.
const NET_Y = 11.885;
const SERVICE_Y = NET_Y + 6.4;
const BASE_Y = 23.77;
const SINGLES = 4.115;
const DOUBLES = 5.485;

const S = 28; // px на метр
const X0 = -6.5;
const X1 = 6.5;
const Y_TOP = 25;
const Y_BOTTOM = 10;
const W = (X1 - X0) * S;
const H = (Y_TOP - Y_BOTTOM) * S;
const NET_ROW = NET_Y - 0.9; // сюда рисуем подачи в сетку

const px = (x: number) => (Math.max(X0 + 0.2, Math.min(X1 - 0.2, x)) - X0) * S;
const py = (y: number) => (Y_TOP - Math.max(Y_BOTTOM + 0.2, Math.min(Y_TOP - 0.2, y))) * S;

const COLORS: Record<Spin, string> = { flat: "var(--color-flat)", slice: "var(--color-slice)", kick: "var(--color-kick)" };
const LABELS: Record<Spin, string> = { flat: "Flat", slice: "Slice", kick: "Kick" };
const RESULT: Record<Serve["result"], string> = { in: "in", out: "out", net: "net" };

const fmtTime = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

export function CourtMap({ serves }: { serves: Serve[] }) {
  const [shown, setShown] = useState<Record<Spin, boolean>>({ flat: true, slice: true, kick: true });
  const [hover, setHover] = useState<Serve | null>(null);
  const visible = serves.filter((s) => shown[s.spin]);

  return (
    <figure className="card p-4 sm:p-5">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">Where they landed</span>
        <span className="flex gap-2" role="group" aria-label="Filter by serve type">
          {(Object.keys(LABELS) as Spin[]).map((spin) => (
            <button
              key={spin}
              type="button"
              aria-pressed={shown[spin]}
              onClick={() => setShown((v) => ({ ...v, [spin]: !v[spin] }))}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs transition aria-pressed:bg-white/10 aria-[pressed=false]:opacity-50"
            >
              <span className="size-2.5 rounded-full" style={{ background: COLORS[spin] }} />
              {LABELS[spin]}
            </button>
          ))}
        </span>
      </figcaption>

      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-4 block w-full max-w-md" role="img" aria-label="Bounce map of serves on the far half of the court">
        <rect x={0} y={0} width={W} height={H} rx={10} fill="#1d4f6e" />
        <g stroke="rgb(255 255 255 / 0.85)" strokeWidth={2} fill="none">
          <rect x={px(-DOUBLES)} y={py(BASE_Y)} width={(2 * DOUBLES) * S} height={(BASE_Y - NET_Y) * S} />
          <line x1={px(-SINGLES)} y1={py(BASE_Y)} x2={px(-SINGLES)} y2={py(NET_Y)} />
          <line x1={px(SINGLES)} y1={py(BASE_Y)} x2={px(SINGLES)} y2={py(NET_Y)} />
          <line x1={px(-SINGLES)} y1={py(SERVICE_Y)} x2={px(SINGLES)} y2={py(SERVICE_Y)} />
          <line x1={px(0)} y1={py(SERVICE_Y)} x2={px(0)} y2={py(NET_Y)} />
        </g>
        <line x1={px(-DOUBLES - 0.5)} y1={py(NET_Y)} x2={px(DOUBLES + 0.5)} y2={py(NET_Y)} stroke="#e8edf2" strokeWidth={4} />
        <text x={px(-DOUBLES)} y={py(NET_ROW) + 18} fill="rgb(255 255 255 / 0.6)" fontSize={11}>
          into the net
        </text>

        {visible.map((s, i) => {
          const x = px(s.bounceX);
          const y = s.result === "net" ? py(NET_ROW) : py(s.bounceY);
          const c = COLORS[s.spin];
          const common = {
            onMouseEnter: () => setHover(s),
            onMouseLeave: () => setHover(null),
            style: { cursor: "default" },
          };
          if (s.result === "net") {
            return (
              <g key={i} {...common}>
                <circle cx={x} cy={y} r={9} fill="transparent" />
                <path d={`M${x - 4} ${y - 4}L${x + 4} ${y + 4}M${x + 4} ${y - 4}L${x - 4} ${y + 4}`} stroke={c} strokeWidth={2.5} />
              </g>
            );
          }
          return (
            <g key={i} {...common}>
              <circle cx={x} cy={y} r={9} fill="transparent" />
              {s.result === "in" ? (
                <circle cx={x} cy={y} r={5} fill={c} stroke="#1d4f6e" strokeWidth={2} />
              ) : (
                <circle cx={x} cy={y} r={4.5} fill="none" stroke={c} strokeWidth={2} />
              )}
            </g>
          );
        })}
      </svg>

      <p className="mt-3 min-h-5 text-center text-sm num" aria-live="polite">
        {hover ? (
          <>
            <b>{LABELS[hover.spin]}</b> · {Math.round(hover.speed)} mph{hover.suspect && " (radar is dreaming)"} · {RESULT[hover.result]}
            {hover.result === "out" && (hover.deep ? ", long" : ", wide")} · {fmtTime(hover.videoTime)} in the video
          </>
        ) : (
          <span className="text-muted">● in · ○ out · × net. Hover a dot.</span>
        )}
      </p>
    </figure>
  );
}
