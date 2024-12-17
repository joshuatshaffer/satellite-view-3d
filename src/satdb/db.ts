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

let dbPromise: Promise<Db> | undefined;

export async function getDb() {
  dbPromise ??= openDB<SatDbSchema>("sat-db", 1, {
    upgrade(db) {
      db.createObjectStore("dataSync");
      db.createObjectStore("tle");
    },
  });

  return await dbPromise;
}
