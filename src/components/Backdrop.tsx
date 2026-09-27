import Image from "next/image";
import { PHOTOS, type PhotoKey } from "@/config/photos";

// Фото чемпиона на фоне: напоминание, как это должно выглядеть.
// На десктопе фото прижато вправо, чтобы игрок не прятался за заголовком.
export function Backdrop({ photo, position = "center" }: { photo: PhotoKey; position?: string }) {
  const p = PHOTOS[photo];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <Image src={p.src} alt="" fill priority sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover opacity-75" style={{ objectPosition: position }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
      </div>
      <div className="absolute inset-0 bg-ink/55 lg:bg-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/35 to-ink" />
    </div>
  );
}
