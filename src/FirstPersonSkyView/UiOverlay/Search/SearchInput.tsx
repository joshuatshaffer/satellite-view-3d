import { useAtom } from "jotai";
import { searchTextAtom } from "../../urlAtom";

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
