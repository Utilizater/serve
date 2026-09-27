import Image from "next/image";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { GoalCard } from "@/components/GoalCard";
import { TrendCharts, type TrendPoint } from "@/components/TrendCharts";
import { FORM_WINDOW, GOALS, PLAYER, SPIN_LABEL, SPINS } from "@/config/goals";
import { fmtLongDate, fmtMonthYear, fmtNum, plural } from "@/lib/format";
import { forecastQuip, sessionQuip } from "@/lib/quips";
import { fmtUtr, getProfile } from "@/lib/profile";
import { listSessions, recentSessions } from "@/lib/sessions";
import { forecast, sessionStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [sessions, recent, profile] = await Promise.all([listSessions(), recentSessions(FORM_WINDOW), getProfile()]);
  const utr = fmtUtr(profile.utr);

  if (sessions.length === 0) {
    return (
      <main className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Backdrop photo="federerClay" />
        <div className="relative">
          <h1 className="font-display text-4xl font-black">No data yet.</h1>
          <p className="mt-4 text-muted">A perfect record: zero double faults.</p>
        </div>
      </main>
    );
  }

  const form = sessionStats(recent.flatMap((s) => s.serves));
  const first = sessions[0];
  const totalServes = sessions.reduce((a, s) => a + s.stats.total.total, 0);
  const totalNet = sessions.reduce((a, s) => a + s.stats.total.net, 0);
  const flatNow = form.flat.avgSpeedIn;
  const flatGap = flatNow === null ? null : Math.round(GOALS.flat.speed - flatNow);

  const points: TrendPoint[] = sessions.map((s) => ({
    date: s.date,
    speed: { flat: s.stats.flat.avgSpeedIn, slice: s.stats.slice.avgSpeedIn, kick: s.stats.kick.avgSpeedIn },
    pct: { flat: s.stats.flat.inPct, slice: s.stats.slice.inPct, kick: s.stats.kick.inPct },
  }));
  const forecasts = SPINS.map((spin) => forecast(sessions, spin));

  return (
    <main className="relative">
      <Backdrop photo="federerClay" position="60% 30%" />

      {/* Герой: цель против реальности */}
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-20">
        <p className="eyebrow text-ball">A public serve diary</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
          Goal: <span className="text-ball">{GOALS.flat.speed}&nbsp;mph</span> flat.
          <br />
          <span className="text-muted">Now: {fmtNum(flatNow)}.</span>
        </h1>
        {flatGap !== null && flatGap > 0 && (
          <p className="mt-6 max-w-2xl text-lg sm:text-xl">
            <span className="font-bold text-ball num">{flatGap}</span> {plural(flatGap, "mile", "miles")} per hour to go.
            Every one of them is on me.
          </p>
        )}
        <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="sessions" value={sessions.length} />
          <Stat label="serves logged" value={totalServes} />
          <Stat label="into the net" value={totalNet} />
          <Stat label="UTR" value={utr} />
        </dl>
      </section>

      {/* Манифест */}
      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">The Declaration</h2>
        <p className="mt-3 max-w-3xl text-muted">
          I, {PLAYER.name}, UTR {utr}, being of sound mind and unreliable toss, hereby commit to bringing my three
          serves up to the numbers below. Current form is based on{" "}
          {recent.length === 1 ? "my only session" : `the last ${recent.length} sessions`}; suspicious speeds don&apos;t count.{" "}
          {sessions.length > 1 && <>The tick on each bar marks where I was on {fmtLongDate(first.date)}.</>}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SPINS.map((spin) => (
            <GoalCard key={spin} spin={spin} current={form[spin]} start={sessions.length > 1 ? first.stats[spin] : null} />
          ))}
        </div>
      </section>

      {/* Динамика и прогноз */}
      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Progress</h2>
        <div className="mt-8">
          <TrendCharts points={points} goals={GOALS} />
        </div>

        <div className="card mt-4 p-5 sm:p-6">
          <h3 className="font-display text-lg font-bold">So, when?</h3>
          <p className="mt-1 text-sm text-muted">{forecastQuip(forecasts.every((f) => f.confident))}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-3">
            {forecasts.map((f) => (
              <li key={f.spin}>
                <p className="eyebrow">{SPIN_LABEL[f.spin]}</p>
                <p className="mt-1 font-display text-xl font-bold">
                  {f.reached ? "Already!" : f.date ? fmtMonthYear(f.date) : "Never*"}
                </p>
                <p className="mt-1 text-xs text-muted num">
                  {f.speedPerWeek === null
                    ? "Needs at least a second session"
                    : f.date || f.reached
                      ? `pace: ${f.speedPerWeek > 0 ? "+" : ""}${f.speedPerWeek} mph per week`
                      : "*at the current pace. The pace needs to change"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Тренировки */}
      <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Sessions</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...sessions].reverse().map((s) => (
            <li key={s.date}>
              <Link href={`/day/${s.date}`} className="card group block overflow-hidden transition hover:border-ball/50">
                <div className="relative aspect-video bg-surface-2">
                  {s.videoThumb && (
                    <Image
                      src={s.videoThumb}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover opacity-80 transition group-hover:opacity-100"
                    />
                  )}
                  <span className="absolute bottom-3 left-3 rounded-md bg-ink/80 px-2 py-1 font-display text-xs font-bold">
                    {fmtLongDate(s.date)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="flex gap-4 text-sm num">
                    <span>
                      <b>{s.stats.total.total}</b>{" "}
                      <span className="text-muted">{plural(s.stats.total.total, "serve", "serves")}</span>
                    </span>
                    <span>
                      <b>{fmtNum(s.stats.total.inPct, "%")}</b> <span className="text-muted">in</span>
                    </span>
                    <span>
                      <b>{fmtNum(s.stats.flat.avgSpeedIn)}</b> <span className="text-muted">mph flat</span>
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-muted">{sessionQuip(s.stats.total, s.date)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-black num">{value}</dd>
    </div>
  );
}
