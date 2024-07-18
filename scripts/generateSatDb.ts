import { parse } from "csv-parse";

import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";

function formatString(value: string) {
  return JSON.stringify(value);
}

function formatDate(value: string) {
  if (!value) {
    return "null";
  }
  const [year, month, day] = value.split("-").map(Number);
  return `new Date(${year},${month - 1},${day})`;
}

function formatNumber(value: string) {
  return value || "null";
}

createReadStream("src/satcat.csv")
  .pipe(parse({ columns: true }))
  .pipe(
    new Transform({
      objectMode: true,
      construct(callback) {
        this.push(`import { Satellite } from './Satellite';\n`);
        callback();
      },
      transform(row, _, callback) {
        const formattedSatConstructorArgs = [
          formatString(row["OBJECT_NAME"]),
          formatString(row["OBJECT_ID"]),
          formatNumber(row["NORAD_CAT_ID"]),
          formatString(row["OBJECT_TYPE"]),
          formatString(row["OPS_STATUS_CODE"]),
          formatString(row["OWNER"]),
          formatDate(row["LAUNCH_DATE"]),
          formatString(row["LAUNCH_SITE"]),
          formatDate(row["DECAY_DATE"]),
          formatNumber(row["PERIOD"]),
          formatNumber(row["INCLINATION"]),
          formatNumber(row["APOGEE"]),
          formatNumber(row["PERIGEE"]),
          formatNumber(row["RCS"]),
          formatString(row["DATA_STATUS_CODE"]),
          formatString(row["ORBIT_CENTER"]),
          formatString(row["ORBIT_TYPE"]),
        ];

        callback(
          null,
          `new Satellite(${formattedSatConstructorArgs.join(",")});\n`
        );
      },
    })
  )
  .pipe(createWriteStream("src/satcat.generated.js"));
