import { atom, useAtom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { matchSorter } from "match-sorter";
import { getTles } from "../../../satdb/tles";
import { selectedSatelliteIdAtom } from "../../urlAtom";
import styles from "./Search.module.css";

const searchTextAtom = atom("");

const searchResultsAtom = unwrap(
  atom(async (get) =>
    matchSorter(await getTles(), get(searchTextAtom), {
      keys: ["objectName"],
    })
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
      {results.slice(0, 30).map((tle) => {
        const noradId = tle.line1.slice(2, 7);
        return (
          <li
            key={noradId}
            className={styles.searchResult}
            data-selected={selectedSatelliteId === noradId}
            onClick={() => {
              setSelectedSatelliteId(noradId);
            }}
          >
            {tle.objectName}
          </li>
        );
      })}
    </ul>
  );
}

export function Search() {
  const [searchText, setSearchText] = useAtom(searchTextAtom);

  return (
    <div className={styles.search}>
      <input
        type="search"
        value={searchText}
        onChange={(event) => {
          setSearchText(event.currentTarget.value);
        }}
      />
      <button
        type="button"
        onClick={() => {
          setSearchText("");
        }}
      >
        X
      </button>

      <SearchResultList />
    </div>
  );
}
