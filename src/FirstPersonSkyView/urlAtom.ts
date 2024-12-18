import { PrimitiveAtom, atom } from "jotai";

export interface UrlState {
  selectedSatelliteId: string | undefined;
  highlightedSatelliteIds: string[];
}

const selectedSatelliteIdKey = "s";
const highlightedSatelliteIdsKey = "h";

function readStateFromUrl(): UrlState {
  const searchParams = new URLSearchParams(window.location.search.slice(1));

  return {
    selectedSatelliteId: searchParams.get(selectedSatelliteIdKey) || undefined,
    highlightedSatelliteIds:
      searchParams.getAll(highlightedSatelliteIdsKey) || [],
  };
}

function writeStateToUrl(state: UrlState) {
  const searchParams = new URLSearchParams();

  if (state.selectedSatelliteId) {
    searchParams.set(selectedSatelliteIdKey, state.selectedSatelliteId);
  }

  for (const h of state.highlightedSatelliteIds.toSorted()) {
    searchParams.append(highlightedSatelliteIdsKey, h);
  }

  searchParams.sort();
  const searchString = searchParams.toString();
  window.history.replaceState(
    null,
    "",
    searchString ? `?${searchString}` : "."
  );
}

const internalUrlStateAtom = atom(readStateFromUrl());

// TODO: Redirect to canonical URL on first load.
const urlStateAtom: PrimitiveAtom<UrlState> = atom(
  (get) => get(internalUrlStateAtom),
  (get, set, update) => {
    set(internalUrlStateAtom, update);
    writeStateToUrl(get(internalUrlStateAtom));
  }
);

export const selectedSatelliteIdAtom = atom(
  (get) => get(urlStateAtom).selectedSatelliteId,
  (_get, set, selectedSatelliteId: UrlState["selectedSatelliteId"]) =>
    set(urlStateAtom, (prev) =>
      prev.selectedSatelliteId === selectedSatelliteId
        ? prev
        : { ...prev, selectedSatelliteId }
    )
);

export const highlightedSatelliteIdsAtom = atom(
  (get) => get(urlStateAtom).highlightedSatelliteIds,
  (_get, set, highlightedSatelliteIds: UrlState["highlightedSatelliteIds"]) =>
    set(urlStateAtom, (prev) =>
      prev.highlightedSatelliteIds === highlightedSatelliteIds
        ? prev
        : { ...prev, highlightedSatelliteIds }
    )
);
