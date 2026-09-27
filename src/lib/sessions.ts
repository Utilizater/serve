import "server-only";
import { getDb } from "./db";
import type { Session, SessionSummary } from "./types";

async function collection() {
  return (await getDb()).collection<Session>("sessions");
}

// Все тренировки без сырых подач, от старых к новым.
export async function listSessions(): Promise<SessionSummary[]> {
  const col = await collection();
  return col.find({}, { projection: { _id: 0, serves: 0 } }).sort({ date: 1 }).toArray();
}

// Последние n тренировок целиком (с подачами), от старых к новым.
export async function recentSessions(n: number): Promise<Session[]> {
  const col = await collection();
  const docs = await col.find({}, { projection: { _id: 0 } }).sort({ date: -1 }).limit(n).toArray();
  return docs.reverse();
}

export async function getSession(date: string): Promise<Session | null> {
  const col = await collection();
  return col.findOne({ date }, { projection: { _id: 0 } });
}

export async function getNeighbours(date: string) {
  const col = await collection();
  const opts = { projection: { _id: 0, serves: 0 } };
  const [prev, next] = await Promise.all([
    col.find({ date: { $lt: date } }, opts).sort({ date: -1 }).limit(1).next(),
    col.find({ date: { $gt: date } }, opts).sort({ date: 1 }).limit(1).next(),
  ]);
  return { prev: prev as SessionSummary | null, next: next as SessionSummary | null };
}

export async function upsertSession(session: Session): Promise<void> {
  const col = await collection();
  await col.createIndex({ date: 1 }, { unique: true });
  await col.replaceOne({ date: session.date }, session, { upsert: true });
}
