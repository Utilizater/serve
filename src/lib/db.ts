import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type Db } from "mongodb";

declare global {
  var _mongoClient: Promise<MongoClient> | undefined;
}

// Один клиент на процесс: в dev его переживает HMR, на Vercel — тёплые инстансы.
function client(): Promise<MongoClient> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI не задан");
  if (!globalThis._mongoClient) {
    const c = new MongoClient(uri, { maxIdleTimeMS: 5_000 });
    attachDatabasePool(c);
    globalThis._mongoClient = c.connect();
  }
  return globalThis._mongoClient;
}

export async function getDb(): Promise<Db> {
  return (await client()).db(process.env.MONGO_DB_NAME);
}
