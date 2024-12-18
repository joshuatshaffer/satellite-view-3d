import { getDb, Tle } from "./db";

const tleUrl =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle";

async function fetchTles() {
  const response = await fetch(tleUrl);
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

export async function getTles(): Promise<Tle[]> {
  const db = await getDb();
  try {
    // If the data is more than 2 hours old, fetch new data.
    const lastSynced = await db.get("dataSync", "tle");
    if (
      lastSynced === undefined ||
      Date.now() - lastSynced.getTime() > 2 * 60 * 60 * 1000
    ) {
      const tles = await fetchTles();

      // Do not wait for the update to complete before returning the TLEs so that
      // the UI renders faster.
      putTles(tles).catch((error) => {
        console.error("Failed to update TLEs", error);
      });

      return tles;
    }

    return await db.getAll("tle");
  } finally {
    db.close();
  }
}
