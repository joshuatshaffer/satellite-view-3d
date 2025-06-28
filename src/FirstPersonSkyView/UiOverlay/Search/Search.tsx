import { atom, useAtom, useAtomValue } from "jotai";
import { unwrap } from "jotai/utils";
import { matchSorter } from "match-sorter";
import { getTles } from "../../../satdb/tles";
import { selectedSatelliteIdAtom } from "../../urlAtom";
import styles from "./Search.module.css";

const searchTextAtom = atom("");

const searchResultsAtom = unwrap(
  atom(async (get) =>
    matchSorter(
      (await getTles()).map((tle) => ({
        ...tle,
        noradId: tle.line1.slice(2, 7),
      })),
      get(searchTextAtom),
      {
        keys: ["objectName", "noradId"],
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
            <div className={styles.searchResult_objectName}>{objectName}</div>{" "}
            <div>{noradId}</div>
          </li>
        );
      })}
    </ul>
  );
}

function SearchInput() {
  const [searchText, setSearchText] = useAtom(searchTextAtom);

  return (
    <div>
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
    </div>
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
