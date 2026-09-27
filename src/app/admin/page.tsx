import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { getProfile } from "@/lib/profile";
import { UploadForm } from "./UploadForm";
import { UtrForm } from "./UtrForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await getProfile();
  return (
    <main className="relative mx-auto grid max-w-xl gap-4 px-4 py-10 sm:px-6">
      <Backdrop photo="wawrinkaToss" />
      <section className="card relative p-5 sm:p-8">
        <h1 className="font-display text-2xl font-bold">New session</h1>
        <p className="mt-2 text-sm text-muted">
          SwingVision export + video link. If the day already exists, it gets replaced.
        </p>
        <div className="mt-6">
          <UploadForm />
        </div>
      </section>

      <section className="card relative p-5 sm:p-8">
        <h2 className="font-display text-xl font-bold">UTR</h2>
        <p className="mt-2 text-sm text-muted">
          Shown in the header and the Declaration.
          {profile.utrUpdatedAt && ` Last updated ${profile.utrUpdatedAt.toISOString().slice(0, 10)}.`}
        </p>
        <div className="mt-6">
          <UtrForm current={profile.utr} />
        </div>
      </section>
    </main>
  );
}
