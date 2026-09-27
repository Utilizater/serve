// Ссылки вида https://swing.vision/matches/sw2-0pfOH_M
const MATCH_URL = /^https:\/\/(www\.)?swing\.vision\/matches\/[\w-]+\/?$/;

export function isSwingVisionUrl(url: string): boolean {
  return MATCH_URL.test(url);
}

// Плеер SwingVision запрещает iframe, поэтому берём превью из og:image.
export async function fetchThumbnail(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    return m && m[1].startsWith("https://") ? m[1] : null;
  } catch {
    return null;
  }
}
