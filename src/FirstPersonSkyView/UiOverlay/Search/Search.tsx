import { atom, useAtom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { matchSorter } from "match-sorter";
import { getTles } from "../../../satdb/tles";
import { searchTextAtom, selectedSatelliteIdAtom } from "../../urlAtom";
import styles from "./Search.module.css";
import { SearchInput } from "./SearchInput";

function parseTleCosparId(line1: string) {
  const yy = parseInt(line1.slice(9, 11));
  const launchNumberOfYear = line1.slice(11, 14);
  const pieceOfLaunch = line1.slice(14, 17).trim();

  // The first satellite was launched in 1957. We can use this to disambiguate
  // two digit years from TLE data until 2057.
  const launchYear = (yy < 57 ? 2000 : 1900) + yy;

  return `${launchYear}-${launchNumberOfYear}${pieceOfLaunch}`;
}

export const searchResultsAtom = unwrap(
  atom(async (get) =>
    matchSorter(
      (await getTles()).map((tle) => ({
        ...tle,
        noradId: tle.line1.slice(2, 7),
        cosparId: parseTleCosparId(tle.line1),
      })),
      get(searchTextAtom),
      {
        keys: ["objectName", "noradId", "cosparId"],
      }
    )
  ),
  (prev) => prev ?? []
);

function SearchResultList() {
  const results = useAtomValue(searchResultsAtom);
  const [selectedSatelliteId, setSelectedSatelliteId] = useAtom(
    selectedSatelliteIdAtom
  );

  return (
    <ul className={styles.searchResults}>
      {results.slice(0, 30).map(({ noradId, objectName }) => {
        return (
          <li
            key={noradId}
            className={styles.searchResult}
            data-selected={selectedSatelliteId === noradId}
            onClick={() => {
              setSelectedSatelliteId(noradId);
            }}
          >
            <div className={styles.searchResult_objectName}>{objectName}</div>
            <div>{noradId}</div>
          </li>
        );
      })}
    </ul>
  );
}

export function Search() {
  return (
    <div className={styles.search}>
      <SearchInput />
      <SearchResultList />
    </div>
  );
}
