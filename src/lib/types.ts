export type Spin = "flat" | "slice" | "kick";
export type ServeResult = "in" | "out" | "net";

export interface Serve {
  spin: Spin;
  speed: number; // mph
  result: ServeResult;
  bounceX: number; // м, + вправо от камеры
  bounceY: number; // м, + в сторону дальней половины
  deep: boolean; // отскок за линией подачи
  direction: string;
  side: "ad" | "deuce";
  videoTime: number; // сек от начала видео
  suspect: boolean; // скорость похожа на ошибку распознавания
}

export interface SpinStats {
  total: number;
  in: number;
  out: number;
  net: number;
  long: number; // аут за линию подачи
  wide: number; // аут в сторону
  inPct: number | null;
  avgSpeedIn: number | null; // главная метрика скорости
  avgSpeed: number | null;
  maxSpeed: number | null;
  suspect: number;
  bogusTop: number | null; // самая «фантастическая» отброшенная скорость
}

export type SessionStats = Record<Spin, SpinStats> & { total: SpinStats };

export interface Session {
  date: string; // YYYY-MM-DD
  videoUrl: string;
  videoThumb: string | null;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
  serves: Serve[];
  stats: SessionStats;
  uploadedAt: Date;
}

export type SessionSummary = Omit<Session, "serves">;
