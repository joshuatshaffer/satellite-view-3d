import { atom, useAtom, useAtomValue } from "jotai";
import { parseCosparIdFromTle } from "./parseCosparIdFromTle";
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
      {definition?.tle[0] ? (
        <div>COSPAR ID: {parseCosparIdFromTle(definition?.tle[0])}</div>
      ) : null}
      <HighlightedToggle satelliteId={selectedSatelliteId} />
      <ExternalLinks satelliteId={selectedSatelliteId} />
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

function ExternalLinks({ satelliteId }: { satelliteId: string }) {
  const encodedSatelliteId = encodeURIComponent(satelliteId);
  const links = [
    {
      text: "N2YO.com",
      url: `https://www.n2yo.com/satellite/?s=${encodedSatelliteId}`,
    },
    {
      text: "SatNOGS DB",
      url: `https://db.satnogs.org/search/?q=${encodedSatelliteId}`,
    },
    {
      text: "KeepTrack",
      url: `https://app.keeptrack.space/?sat=${encodedSatelliteId}`,
    },
    {
      text: "In-The-Sky.org",
      url: `https://in-the-sky.org/spacecraft.php?id=${encodedSatelliteId}`,
    },
    {
      text: "Heavens-Above",
      url: `https://heavens-above.com/satinfo.aspx?satid=${encodedSatelliteId}`,
    },
    {
      text: "Satcat",
      url: `https://www.satcat.com/sats/${encodedSatelliteId}`,
    },
  ];

  return (
    <ul>
      {links.map(({ url, text }) => (
        <li key={url}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        </li>
      ))}
    </ul>
  );
}
