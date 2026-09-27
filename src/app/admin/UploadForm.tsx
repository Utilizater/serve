"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { uploadSession, type UploadState } from "./actions";

const DATE_IN_NAME = /(\d{4}-\d{2}-\d{2})/;

export function UploadForm() {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadSession, { status: "idle" });
  const [date, setDate] = useState("");

  return (
    <form action={action} className="grid gap-5">
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className="input" />
      </Field>

      <Field label="SwingVision export (.xlsx)" hint="Date is taken from the file name">
        <input
          name="file"
          type="file"
          accept=".xlsx"
          required
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-ball file:px-3 file:py-1.5 file:font-semibold file:text-ink"
          onChange={(e) => {
            const m = e.target.files?.[0]?.name.match(DATE_IN_NAME);
            if (m) setDate(m[1]);
          }}
        />
      </Field>

      <Field label="Session date">
        <input name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
      </Field>

      <Field label="Video link" hint="https://swing.vision/matches/…">
        <input name="videoUrl" type="url" required placeholder="https://swing.vision/matches/sw2-…" className="input" />
      </Field>

      <Field label="Note of the day" hint="Optional. The best place for self-deprecation">
        <textarea name="note" rows={3} className="input resize-y" placeholder="The net was in great form today." />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ball px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Counting the damage…" : "Upload session"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      {state.status === "ok" && (
        <p role="status" className="rounded-lg border border-ball/40 bg-ball/10 px-4 py-3 text-sm">
          Done: {state.serves} serves for {state.date}
          {state.skipped > 0 && `, ${state.skipped} rows weren't serves`}
          {state.suspect > 0 && `, ${state.suspect} suspiciously fast ones set aside`}.{" "}
          <Link href={`/day/${state.date}`} className="font-semibold underline underline-offset-4">
            Open the day →
          </Link>
        </p>
      )}
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold">
        {label}
        {hint && <span className="ml-2 font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
