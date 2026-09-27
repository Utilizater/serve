# 90 mph. Когда-нибудь

Дневник подачи на данных SwingVision: цели по флэту, слайсу и кику, статистика по тренировкам, ссылка на видео.

## Запуск

```bash
npm install
npm run dev            # http://localhost:3000
```

`.env`: `MONGO_URI`, `MONGO_DB_NAME`, `ADMIN_PASSWORD`.

## Новая тренировка

- **Через сайт:** `/admin` → пароль, xlsx из SwingVision, ссылка `https://swing.vision/matches/…`, комментарий дня.
  Дата подставляется из имени файла. Повторная загрузка того же дня перезаписывает его.
- **Из консоли:** `npm run seed -- "data/SwingVision-Serve Practice-2026-09-23 at 22.35.27.xlsx" https://swing.vision/matches/sw2-TA-L2aA`

`npm run check-parse` — прогнать парсер по файлам в `data/` и показать таблицу метрик.

## Как считается

- Подачи — строки листа `Shots` с `Type = serve`. Случайные форхенды и бэкхенды отбрасываются.
- **Попадания** — `In / все подачи` этого типа.
- **Скорость** — средняя по попавшим подачам. Скорость выше медианы типа в 1.35 раза считается ошибкой распознавания
  (`SUSPECT_RATIO` в `src/lib/parse.ts`) и в среднее не идёт.
- **Текущая форма** на главной — все подачи последних 3 тренировок (`FORM_WINDOW`).
- **Прогноз** — линейный тренд по тренировкам до пересечения обеих целей.
- Цели — `src/config/goals.ts`.

## Деплой на Vercel

1. Залить репозиторий на GitHub и импортировать в Vercel (или `npx vercel`).
2. В Settings → Environment Variables добавить три переменные из `.env`.
3. В MongoDB Atlas → Network Access разрешить `0.0.0.0/0` (у Vercel нет фиксированных IP)
   или подключить интеграцию Vercel ↔ Atlas.

Фото на фоне — Wikimedia Commons, авторы и лицензии в `src/config/photos.ts` и в футере сайта.
