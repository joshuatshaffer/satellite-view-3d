import { useAtom } from "jotai";
import { useRef } from "react";
import { searchTextAtom } from "../../urlAtom";

export function SearchInput() {
  const [searchText, setSearchText] = useAtom(searchTextAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="search"
        placeholder="Search satellites"
        value={searchText}
        onChange={(event) => {
          setSearchText(event.currentTarget.value);
        }}
        autoFocus
      />
      <button
        type="button"
        onClick={() => {
          setSearchText("");
          inputRef.current?.focus();
        }}
      >
        X
      </button>
    </div>
  );
}
