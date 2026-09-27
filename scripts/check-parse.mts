// Проверка парсера на локальных экспортах: npx tsx scripts/check-parse.ts data/*.xlsx
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { dateFromFilename, parseSwingVision } from "../src/lib/parse";
import { sessionStats } from "../src/lib/stats";

for (const file of process.argv.slice(2)) {
  const buf = readFileSync(file);
  const parsed = await parseSwingVision(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const stats = sessionStats(parsed.serves);
  console.log(`\n${dateFromFilename(basename(file))}  ${parsed.startTime}–${parsed.endTime}  serves=${parsed.serves.length} skipped=${parsed.skipped}`);
  console.table(
    Object.fromEntries(
      Object.entries(stats).map(([k, s]) => [
        k,
        { n: s.total, "in%": s.inPct, avgIn: s.avgSpeedIn, avg: s.avgSpeed, max: s.maxSpeed, net: s.net, long: s.long, wide: s.wide, suspect: s.suspect, bogusTop: s.bogusTop },
      ]),
    ),
  );
}
