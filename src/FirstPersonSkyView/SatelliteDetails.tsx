import { atom, useAtom, useAtomValue } from "jotai";
import { satelliteDefinitionsAtom } from "./SatelliteDefinitions";
import styles from "./SatelliteDetails.module.css";
import {
  highlightedSatelliteIdsAtom,
  selectedSatelliteIdAtom,
} from "./urlAtom";

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
      <div>NORAD ID: {selectedSatelliteId}</div>
      <HighlightedToggle satelliteId={selectedSatelliteId} />
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
      <a
        href={`https://app.keeptrack.space/?sat=${encodeURIComponent(
          selectedSatelliteId
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View in KeepTrack
      </a>
      <br />
      &nbsp;
    </div>
  );
}

function HighlightedToggle({ satelliteId }: { satelliteId: string }) {
  const [highlightedSatelliteIds, setHighlightedSatelliteIds] = useAtom(
    highlightedSatelliteIdsAtom
  );

  const isHighlighted = highlightedSatelliteIds.includes(satelliteId);

  const setIsHighlighted = (isHighlighted: boolean) => {
    if (isHighlighted) {
      setHighlightedSatelliteIds(
        highlightedSatelliteIds.includes(satelliteId)
          ? highlightedSatelliteIds
          : [...highlightedSatelliteIds, satelliteId]
      );
    } else {
      setHighlightedSatelliteIds(
        highlightedSatelliteIds.filter((id) => id !== satelliteId)
      );
    }
  };

  return (
    <label>
      <input
        type="checkbox"
        checked={isHighlighted}
        onChange={(e) => {
          setIsHighlighted(e.target.checked);
        }}
      />{" "}
      Highlighted
    </label>
  );
}
