import { atom, useAtomValue } from "jotai";
import { satelliteDefinitionsAtom } from "./SatelliteDefinitions";
import styles from "./SatelliteDetails.module.css";
import { selectedSatelliteIdAtom } from "./urlAtom";

const selectedSatelliteDefinitionAtom = atom((get) => {
  const selectedSatelliteId = get(selectedSatelliteIdAtom);

  if (selectedSatelliteId === undefined) {
    return undefined;
  }

  return get(satelliteDefinitionsAtom).definitions.get(selectedSatelliteId);
});

export function SatelliteDetails() {
  const selectedSatelliteId = useAtomValue(selectedSatelliteIdAtom);
  const definition = useAtomValue(selectedSatelliteDefinitionAtom);

  if (selectedSatelliteId === undefined) {
    return null;
  }

  return (
    <div className={styles.satelliteDetails}>
      <span>
        {definition?.displayName ?? `Satellite ${selectedSatelliteId}`}
      </span>
      <br />
      <a
        href={`https://www.n2yo.com/satellite/?s=${encodeURIComponent(
          selectedSatelliteId
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on N2YO.com
      </a>
      <br />
      <a
        href={`https://db.satnogs.org/search/?q=${encodeURIComponent(
          selectedSatelliteId
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Search SatNOGS DB
      </a>
      <br />
      &nbsp;
    </div>
  );
}
