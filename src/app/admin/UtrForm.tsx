"use client";

import { useActionState } from "react";
import { updateUtr, type UtrState } from "./actions";

export function UtrForm({ current }: { current: number }) {
  const [state, action, pending] = useActionState<UtrState, FormData>(updateUtr, { status: "idle" });

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">UTR</span>
          <input
            name="utr"
            type="number"
            step="0.01"
            min="1"
            max="16.5"
            required
            defaultValue={current.toFixed(2)}
            className="input num"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">Password</span>
          <input name="password" type="password" required autoComplete="current-password" className="input" />
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-ball px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-ball transition hover:bg-ball/10 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update UTR"}
      </button>

      {state.status === "error" && (
        <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm">
          {state.message}
        </p>
      )}
      {state.status === "ok" && (
        <p role="status" className="rounded-lg border border-ball/40 bg-ball/10 px-4 py-3 text-sm num">
          UTR is now {state.utr.toFixed(2)}. The rating goes up, the serve stays the same.
        </p>
      )}
    </form>
  );
}
