import Image from "next/image";

export function VideoCard({ url, thumb }: { url: string; thumb: string | null }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group block overflow-hidden transition hover:border-ball/50"
    >
      <div className="relative aspect-video bg-surface-2">
        {thumb && <Image src={thumb} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />}
        <div className="absolute inset-0 grid place-items-center bg-ink/30 transition group-hover:bg-ink/10">
          <span className="grid size-14 place-items-center rounded-full bg-ball text-ink shadow-lg transition group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 size-6" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="font-semibold">Watch on SwingVision</p>
          <p className="text-xs text-muted">Opens in a new tab. Watch at your own risk.</p>
        </div>
        <span aria-hidden className="text-muted transition group-hover:translate-x-1 group-hover:text-text">
          ↗
        </span>
      </div>
    </a>
  );
}
