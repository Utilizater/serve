// Загрузка тренировки из консоли, минуя админку:
//   npm run seed -- data/<файл>.xlsx https://swing.vision/matches/<id> ["комментарий"]
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { dateFromFilename, parseSwingVision } from "../src/lib/parse";
import { upsertSession } from "../src/lib/sessions";
import { sessionStats } from "../src/lib/stats";
import { fetchThumbnail, isSwingVisionUrl } from "../src/lib/swingvision";

const [file, videoUrl, note] = process.argv.slice(2);
const date = file && dateFromFilename(basename(file));
if (!file || !date || !videoUrl || !isSwingVisionUrl(videoUrl)) {
  console.error("usage: npm run seed -- <SwingVision-...-YYYY-MM-DD ...xlsx> <https://swing.vision/matches/...> [note]");
  process.exit(1);
}

const buf = readFileSync(file);
const parsed = await parseSwingVision(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const stats = sessionStats(parsed.serves);
await upsertSession({
  date,
  videoUrl,
  videoThumb: await fetchThumbnail(videoUrl),
  startTime: parsed.startTime,
  endTime: parsed.endTime,
  note: note ?? null,
  serves: parsed.serves,
  stats,
  uploadedAt: new Date(),
});
console.log(`${date}: ${parsed.serves.length} подач, ${stats.total.inPct}% в корт`);
process.exit(0);
