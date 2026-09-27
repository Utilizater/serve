// Фоновые фото с Wikimedia Commons. Лицензии требуют указать автора — см. футер.
export const PHOTOS = {
  federerClay: {
    src: "/bg/federer-clay.jpg",
    caption: "Federer on clay",
    author: "JC",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Federer_serves_on_clay.jpg",
  },
  federerWimbledon: {
    src: "/bg/federer-wimbledon.jpg",
    caption: "Federer, Wimbledon 2012",
    author: "Nick Webb",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Roger_Federer_serve_in_Wimbledon_2012.jpg",
  },
  djokovicTrophy: {
    src: "/bg/djokovic-trophy.jpg",
    caption: "Djokovic in the trophy pose",
    author: "JC",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Djokovic_trophy_pose_on_serve_(1)_(7861312738).jpg",
  },
  wawrinkaToss: {
    src: "/bg/wawrinka-toss.jpg",
    caption: "Wawrinka, ball toss",
    author: "VasuVR",
    license: "CC BY 4.0",
    source: "https://commons.wikimedia.org/wiki/File:CHO12-Stan_Wawrinka_serve_toss_Chennai_Open.jpg",
  },
} as const;

export type PhotoKey = keyof typeof PHOTOS;

// Для страниц дней — детерминированно по дате, чтобы фон не прыгал.
export function photoForDate(date: string): PhotoKey {
  const pool: PhotoKey[] = ["federerWimbledon", "djokovicTrophy", "wawrinkaToss"];
  const n = [...date].reduce((a, c) => a + c.charCodeAt(0), 0);
  return pool[n % pool.length];
}
