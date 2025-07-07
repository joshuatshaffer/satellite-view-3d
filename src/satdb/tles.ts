import { atom } from "jotai";
import { getDb, Tle, withDb } from "./db";
import { daysToMs } from "./ms";

const tleUrl =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";

/**
 * CelesTrak updates the TLEs at most every 2 hours.
 */
const tleMaxAgeMs = 1 * daysToMs;

async function fetchTles({ signal }: { signal?: AbortSignal } = {}) {
  const response = await fetch(tleUrl, { signal });
  const body = await response.text();
  const lines = body.split("\n");
  const tles: Tle[] = [];

  for (let i = 0; i < lines.length - 2; i += 3) {
    tles.push({
      objectName: lines[i].trim(),
      line1: lines[i + 1],
      line2: lines[i + 2],
    });
  }
  return tles;
}

async function putTles(tles: Tle[]) {
  const db = await getDb();
  try {
    const tx = db.transaction(["tle", "dataSync"], "readwrite");
    await Promise.all([
      tx.db
        .clear("tle")
        .then(() =>
          Promise.all(
            tles.map((tle) => tx.db.put("tle", tle, tle.line1.slice(2, 7)))
          )
        ),
      tx.db.put("dataSync", new Date(), "tle"),
      tx.done,
    ]);
  } finally {
    db.close();
  }
}

export const tlesAtom = atom<Tle[]>([]);

tlesAtom.onMount = (setAtom) => {
  const abortController = new AbortController();
  const signal = abortController.signal;
  let nextSyncTimeout: ReturnType<typeof setTimeout> | undefined;

  const sync = async () => {
    try {
      const tles = await fetchTles({ signal });

      // Do not wait for the update to complete before returning the TLEs so
      // that the UI updates faster.
      putTles(tles).catch((error) => {
        console.error("Failed to save TLEs to IndexedDB", error);
      });

      setAtom(tles);
    } catch (error) {
      console.error("Failed to fetch TLEs", error);
    }

    if (!signal.aborted) {
      await scheduleNextSync();
    }
  };

  const scheduleNextSync = async () => {
    // When the data is more than 2 hours old, fetch new data.
    const lastSynced = await withDb((db) => db.get("dataSync", "tle"));

    const timeUntilNextSync =
      lastSynced === undefined
        ? 0
        : tleMaxAgeMs - (Date.now() - lastSynced.getTime());

    setTimeout(sync, Math.max(0, timeUntilNextSync));
  };

  (async () => {
    setAtom(await withDb((db) => db.getAll("tle")));

    await scheduleNextSync();
  })();

  return () => {
    if (nextSyncTimeout !== undefined) {
      clearTimeout(nextSyncTimeout);
    }
    abortController.abort();
  };
};
