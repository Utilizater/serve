import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import Link from "next/link";
import { PLAYER } from "@/config/goals";
import { PHOTOS } from "@/config/photos";
import { fmtUtr, getProfile } from "@/lib/profile";
import "./globals.css";

const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], weight: ["500", "700", "900"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "90 mph. Someday.",
  description: "A public serve diary: goals, SwingVision stats and an honest measure of how far I am from the dream.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Шапка не должна ронять весь сайт, если база прилегла.
  const utr = await getProfile().then((p) => p.utr, () => PLAYER.utr);
  return (
    <html lang="en" className={`${unbounded.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="font-display text-sm font-black uppercase tracking-wider">
            90 mph<span className="text-ball">.</span> <span className="font-medium text-muted">Someday</span>
          </Link>
          <span className="hidden text-xs text-muted sm:block">the serve diary of a UTR {fmtUtr(utr)} player</span>
        </header>
        {children}
        <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-16 text-xs text-muted sm:px-6">
          <p>
            Data: SwingVision. Photos: Wikimedia Commons —{" "}
            {Object.values(PHOTOS).map((p, i) => (
              <span key={p.src}>
                {i > 0 && " · "}
                <a href={p.source} className="underline decoration-line underline-offset-2 hover:text-text">
                  {p.caption}
                </a>{" "}
                ({p.author}, {p.license})
              </span>
            ))}
            . Tennis ball icon:{" "}
            <a href="https://openmoji.org/library/emoji-1F3BE/" className="underline decoration-line underline-offset-2 hover:text-text">
              OpenMoji
            </a>{" "}
            (CC BY-SA 4.0). The people in these photos have nothing to do with this site and, fortunately, don&apos;t know it exists.
          </p>
          <p className="mt-2">
            <Link href="/admin" className="hover:text-text">
              ·
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}
