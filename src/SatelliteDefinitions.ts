import { atom } from "jotai";
import * as satellite from "satellite.js";

export type Tle = [line1: string, line2: string];

export interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export const satelliteDefinitionsAtom = atom<{
  definitions: ReadonlyMap<string, SatelliteDefinition>;
  records: ReadonlyMap<string, satellite.SatRec>;
}>({ definitions: new Map(), records: new Map() });

export const setSatellitesAtom = atom(
  null,
  (_get, set, newDefinitions: Iterable<SatelliteDefinition>) => {
    const definitions = new Map<string, SatelliteDefinition>();
    const records = new Map<string, satellite.SatRec>();

    for (const definition of newDefinitions) {
      const record = satellite.twoline2satrec(
        definition.tle[0],
        definition.tle[1]
      );

      const id = record.satnum;

      definitions.set(id, definition);
      records.set(id, record);
    }

    set(satelliteDefinitionsAtom, { definitions, records });
  }
);
