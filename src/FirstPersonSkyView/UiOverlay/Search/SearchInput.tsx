import { atom, useAtom } from "jotai";

export const searchTextAtom = atom("");

export function SearchInput() {
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
