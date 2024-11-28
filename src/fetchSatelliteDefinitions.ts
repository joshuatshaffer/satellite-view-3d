import tleUrl from "./generated/tle.txt";
import { SatelliteDefinition } from "./SatelliteDefinitions";

export async function fetchSatelliteDefinitions() {
  const response = await fetch(tleUrl);
  const tle = await response.text();
  const lines = tle.split("\n");
  const definitions: SatelliteDefinition[] = [];

  for (let i = 0; i < lines.length - 2; i += 3) {
    definitions.push({
      displayName: lines[i],
      tle: [lines[i + 1], lines[i + 2]],
    });
  }

  return definitions;
}
