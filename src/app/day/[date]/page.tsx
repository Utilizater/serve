import Link from "next/link";
import { notFound } from "next/navigation";
import { Backdrop } from "@/components/Backdrop";
import { CourtMap } from "@/components/CourtMap";
import { VideoCard } from "@/components/VideoCard";
import { GOALS, SPIN_LABEL, SPINS } from "@/config/goals";
import { photoForDate } from "@/config/photos";
import { duration, fmtLongDate, fmtNum, fmtWeekday } from "@/lib/format";
import { bogusQuip, netQuip, sessionQuip } from "@/lib/quips";
import { getNeighbours, getSession } from "@/lib/sessions";
import type { Serve, Spin, SpinStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const SPIN_BG: Record<Spin, string> = { flat: "bg-flat", slice: "bg-slice", kick: "bg-kick" };

export async function generateMetadata(props: PageProps<"/day/[date]">) {
  const { date } = await props.params;
  return { title: `${fmtLongDate(date)} — 90 mph. Someday.` };
}

export default async function DayPage(props: PageProps<"/day/[date]">) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [session, { prev, next }] = await Promise.all([getSession(date), getNeighbours(date)]);
  if (!session) notFound();

  const { stats } = session;
  const len = duration(session.startTime, session.endTime);
  const rows: { key: Spin | "total"; label: string; s: SpinStats; p: SpinStats | null }[] = [
    ...SPINS.map((spin) => ({ key: spin, label: SPIN_LABEL[spin], s: stats[spin], p: prev?.stats[spin] ?? null })),
    { key: "total", label: "Total", s: stats.total, p: prev?.stats.total ?? null },
  ];
  const bogus = session.serves.filter((s) => s.suspect).sort((a, b) => b.speed - a.speed);
  const net = netQuip(stats.total.net, stats.total.total);

  return (
    <main className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <Backdrop photo={photoForDate(date)} />

      <nav className="relative flex items-center justify-between py-4 text-sm text-muted">
        <Link href="/" className="hover:text-text">
          ← All sessions
        </Link>
        <span className="flex gap-4">
          {prev && (
            <Link href={`/day/${prev.date}`} className="hover:text-text">
              ← {fmtLongDate(prev.date)}
            </Link>
          )}
          {next && (
            <Link href={`/day/${next.date}`} className="hover:text-text">
              {fmtLongDate(next.date)} →
            </Link>
          )}
        </span>
      </nav>

      <header className="relative pb-10 pt-6">
        <p className="eyebrow text-ball">
          Session · {fmtWeekday(date)}
          {session.startTime && ` · ${session.startTime.slice(0, 5)}`}
          {len && ` · ${len}`}
        </p>
        <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">{fmtLongDate(date)}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{sessionQuip(stats.total, date)}</p>
      </header>

      <div className="relative grid gap-4 lg:grid-cols-3">
        <section className="card overflow-x-auto p-4 sm:p-5 lg:col-span-2">
          <h2 className="font-semibold">The numbers</h2>
          <p className="mt-1 text-xs text-muted">
            {prev ? `Arrows show the change since ${fmtLongDate(prev.date)}.` : "First session — nothing to compare with, which is lovely."}
          </p>
          <table className="mt-4 w-full min-w-[520px] text-sm num">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-medium">Serve</th>
                <th className="py-2 pr-3 text-right font-medium">Serves</th>
                <th className="py-2 pr-3 text-right font-medium">In</th>
                <th className="py-2 pr-3 text-right font-medium">Speed*</th>
                <th className="py-2 pr-3 text-right font-medium">Max</th>
                <th className="py-2 pr-3 text-right font-medium">Net</th>
                <th className="py-2 text-right font-medium">Out: long / wide</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ key, label, s, p }) => (
                <tr key={key} className={`border-b border-line last:border-0 ${key === "total" ? "font-semibold" : ""}`}>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-2">
                      {key !== "total" && <span className={`size-2.5 rounded-full ${SPIN_BG[key]}`} aria-hidden />}
                      {label}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">{s.total}</td>
                  <td className="py-3 pr-3 text-right">
                    {fmtNum(s.inPct, "%")}
                    <Delta now={s.inPct} before={p?.inPct ?? null} />
                    {key !== "total" && <Goal value={GOALS[key].inPct} unit="%" />}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {fmtNum(s.avgSpeedIn)}
                    <Delta now={s.avgSpeedIn} before={p?.avgSpeedIn ?? null} />
                    {key !== "total" && <Goal value={GOALS[key].speed} unit="" />}
                  </td>
                  <td className="py-3 pr-3 text-right">{fmtNum(s.maxSpeed)}</td>
                  <td className="py-3 pr-3 text-right">{s.net}</td>
                  <td className="py-3 text-right">
                    {s.long} / {s.wide}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">* average speed of serves that went in, mph. The goal is shown under each value.</p>
        </section>

        <div className="flex flex-col gap-4">
          <VideoCard url={session.videoUrl} thumb={session.videoThumb} />
          <section className="card p-4 sm:p-5">
            <h2 className="font-semibold">Post-mortem</h2>
            <ul className="mt-3 grid gap-3 text-sm">
              {session.note && <li className="border-l-2 border-ball pl-3 italic">“{session.note}”</li>}
              {net && (
                <li>
                  <span className="font-display font-bold num">
                    Net {stats.total.net}, Nikita 0.
                  </span>{" "}
                  <span className="text-muted">{net}</span>
                </li>
              )}
              {bogus.length > 0 && <li className="text-muted">{bogusQuip(bogus.map((s) => s.speed))}</li>}
            </ul>
          </section>
        </div>
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourtMap serves={session.serves} />
        </div>
        <Directions serves={session.serves} />
      </div>
    </main>
  );
}

function Delta({ now, before }: { now: number | null; before: number | null }) {
  if (now === null || before === null) return null;
  const d = Math.round(now - before);
  if (d === 0) return <span className="ml-1.5 text-xs text-muted">=</span>;
  return (
    <span className={`ml-1.5 text-xs ${d > 0 ? "text-ball" : "text-bad"}`}>
      {d > 0 ? "▲" : "▼"}
      {Math.abs(d)}
    </span>
  );
}

function Goal({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="block text-[11px] text-muted">
      / {value}
      {unit}
    </span>
  );
}

// Попадания по направлениям: в «T» или в сторону.
function Directions({ serves }: { serves: Serve[] }) {
  const dirs = [
    { key: "down the T", label: "Down the T" },
    { key: "out wide", label: "Out wide" },
  ];
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="font-semibold">Where I aimed</h2>
      <p className="mt-1 text-xs text-muted">In % by serve direction.</p>
      <table className="mt-4 w-full text-sm num">
        <thead className="text-left text-xs text-muted">
          <tr className="border-b border-line">
            <th className="py-2 pr-3 font-medium">Serve</th>
            {dirs.map((d) => (
              <th key={d.key} className="py-2 pl-3 text-right font-medium">
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SPINS.map((spin) => (
            <tr key={spin} className="border-b border-line last:border-0">
              <td className="py-3 pr-3">{SPIN_LABEL[spin]}</td>
              {dirs.map((d) => {
                const group = serves.filter((s) => s.spin === spin && s.direction === d.key);
                const ins = group.filter((s) => s.result === "in").length;
                return (
                  <td key={d.key} className="py-3 pl-3 text-right">
                    {group.length ? `${Math.round((100 * ins) / group.length)}%` : "—"}
                    <span className="block text-[11px] text-muted">
                      {ins} of {group.length}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
