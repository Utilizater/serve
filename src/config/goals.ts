import type { Spin } from "@/lib/types";

// Задекларированные цели. Меняются только в коде — это манифест, а не настройка.
export const PLAYER = {
  name: "Nikita Polevoi",
  utr: 3.17, // значение по умолчанию; актуальный UTR правится в админке
};

export interface Goal {
  speed: number; // mph, средняя скорость попавших подач
  inPct: number; // % попаданий
  role: string;
}

export const GOALS: Record<Spin, Goal> = {
  flat: { speed: 90, inPct: 60, role: "The first-serve cannon" },
  slice: { speed: 80, inPct: 70, role: "The reliable first serve" },
  kick: { speed: 70, inPct: 85, role: "Second serve, no double faults" },
};

export const SPINS: Spin[] = ["flat", "slice", "kick"];

export const SPIN_LABEL: Record<Spin, string> = {
  flat: "Flat",
  slice: "Slice",
  kick: "Kick",
};

// Сколько последних тренировок считаем «текущей формой».
export const FORM_WINDOW = 3;
