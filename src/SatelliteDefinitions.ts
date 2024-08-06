import * as satellite from "satellite.js";

export type Tle = [line1: string, line2: string];

export interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export class SatelliteDefinitions {
  public readonly definitions = new Map<string, SatelliteDefinition>();
  public readonly records = new Map<string, satellite.SatRec>();

  public readonly dependents = new Set<{
    needsUpdate: boolean;
  }>();

  setSatellites(newDefinitions: Iterable<SatelliteDefinition>) {
    this.definitions.clear();
    this.records.clear();

    for (const definition of newDefinitions) {
      const record = satellite.twoline2satrec(
        definition.tle[0],
        definition.tle[1]
      );

      const id = record.satnum;

      this.definitions.set(id, definition);
      this.records.set(id, record);
    }

    for (const dependent of this.dependents) {
      dependent.needsUpdate = true;
    }
  }
}
