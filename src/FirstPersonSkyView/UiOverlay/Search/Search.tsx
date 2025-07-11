import { atom, useAtom, useAtomValue } from "jotai";
import { matchSorter } from "match-sorter";
import { tlesAtom } from "../../../satdb/tles";
import { parseCosparIdFromTle } from "../../parseCosparIdFromTle";
import { searchTextAtom, selectedSatelliteIdAtom } from "../../urlAtom";
import styles from "./Search.module.css";
import { SearchInput } from "./SearchInput";

export const searchResultsAtom = atom((get) =>
  matchSorter(
    get(tlesAtom).map((tle) => ({
      ...tle,
      noradId: tle.line1.slice(2, 7),
      cosparId: parseCosparIdFromTle(tle.line1),
    })),
    get(searchTextAtom),
    {
      keys: ["objectName", "noradId", "cosparId"],
    }
  )
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
