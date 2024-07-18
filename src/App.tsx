import { parse } from "csv-parse/browser/esm/sync";
import satCatUrl from "./satcat.csv?url";

interface SatelliteCsvRow {
  OBJECT_NAME: "RESURS-P 1 DEB";
  OBJECT_ID: "2013-030N";
  NORAD_CAT_ID: "60224";
  OBJECT_TYPE: "DEB";
  OPS_STATUS_CODE: "D";
  OWNER: "CIS";
  LAUNCH_DATE: "2013-06-25";
  LAUNCH_SITE: "TYMSC";
  DECAY_DATE: "2024-07-12";
  PERIOD: "88.93";
  INCLINATION: "96.99";
  APOGEE: "232";
  PERIGEE: "211";
  RCS: "";
  DATA_STATUS_CODE: "";
  ORBIT_CENTER: "EA";
  ORBIT_TYPE: "IMP";
}

class Satellite {
  objectName: string;
  objectId: string;
  noradCatId: string;
  objectType: string;
  opsStatusCode: string;
  owner: string;
  launchDate: Date;
  launchSite: string;
  decayDate: Date;
  period: number;
  inclination: number;
  apogee: number;
  perigee: number;
  rcs: string;
  dataStatusCode: string;
  orbitCenter: string;
  orbitType: string;

  constructor(row: SatelliteCsvRow) {
    this.objectName = row["OBJECT_NAME"];
    this.objectId = row["OBJECT_ID"];
    this.noradCatId = row["NORAD_CAT_ID"];
    this.objectType = row["OBJECT_TYPE"];
    this.opsStatusCode = row["OPS_STATUS_CODE"];
    this.owner = row["OWNER"];
    this.launchDate = new Date(row["LAUNCH_DATE"]);
    this.launchSite = row["LAUNCH_SITE"];
    this.decayDate = new Date(row["DECAY_DATE"]);
    this.period = parseFloat(row["PERIOD"]);
    this.inclination = parseFloat(row["INCLINATION"]);
    this.apogee = parseFloat(row["APOGEE"]);
    this.perigee = parseFloat(row["PERIGEE"]);
    this.rcs = row["RCS"];
    this.dataStatusCode = row["DATA_STATUS_CODE"];
    this.orbitCenter = row["ORBIT_CENTER"];
    this.orbitType = row["ORBIT_TYPE"];
  }
}

const byObjectName: Record<string, unknown> = {};
const byObjectId: Record<string, unknown> = {};
const byNoradCatId: Record<string, unknown> = {};

const satCatCsv = (async () => {
  const res = await fetch(satCatUrl);
  const text = await res.text();

  for (const sat of parse(text, {
    columns: true,
  }) as any) {
    const satObj = new Satellite(sat);
    byObjectName[satObj.objectName] = satObj;
    byObjectId[satObj.objectId] = satObj;
    byNoradCatId[satObj.noradCatId] = satObj;
    await Promise.resolve();
  }
})();

export function App() {
  return <>TODO</>;
}
