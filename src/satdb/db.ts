import { DBSchema, IDBPDatabase, openDB } from "idb";

export type NoradId = string;

export interface Tle {
  objectName: string;
  line1: string;
  line2: string;
}

export type DataSyncKey = "tle";

interface SatDbSchema extends DBSchema {
  dataSync: { value: Date; key: DataSyncKey };
  tle: { value: Tle; key: NoradId };
}

export interface Db extends IDBPDatabase<SatDbSchema> {}

// TODO: Use the `using` keyword instead of `try`/`finally`.
//
// TODO: Reuse the database connection if `getDb` is called multiple times
//       before closing.
export async function getDb() {
  return await openDB<SatDbSchema>("sat-db", 1, {
    upgrade(db) {
      db.createObjectStore("dataSync");
      db.createObjectStore("tle");
    },
  });
}

export async function withDb<T>(fn: (db: Db) => PromiseLike<T>) {
  const db = await getDb();
  try {
    return await fn(db);
  } finally {
    db.close();
  }
}
