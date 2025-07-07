import { atom } from "jotai";
import * as satellite from "satellite.js";
import { NoradId } from "../satdb/db";
import { tlesAtom } from "../satdb/tles";

export type Tle = [line1: string, line2: string];

export interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export const satelliteDefinitionsAtom = atom((get) => {
  const definitions = new Map<NoradId, SatelliteDefinition>();
  const records = new Map<NoradId, satellite.SatRec>();

  for (const tle of get(tlesAtom)) {
    const record = satellite.twoline2satrec(tle.line1, tle.line2);

    const id = record.satnum;

    definitions.set(id, {
      displayName: tle.objectName,
      tle: [tle.line1, tle.line2],
    });
    records.set(id, record);
  }

  return { definitions, records };
});
