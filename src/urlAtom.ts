import { PrimitiveAtom, atom } from "jotai";

export interface UrlState {
  selectedSatelliteId: string | undefined;
}

const selectedSatelliteIdKey = "selected-satellite-id";

function readStateFromUrl(): UrlState {
  const searchParams = new URLSearchParams(window.location.search.slice(1));

  return {
    selectedSatelliteId: searchParams.get(selectedSatelliteIdKey) || undefined,
  };
}

function writeStateToUrl(state: UrlState) {
  const searchParams = new URLSearchParams();
  if (state.selectedSatelliteId) {
    searchParams.set(selectedSatelliteIdKey, state.selectedSatelliteId);
  }

  window.history.replaceState(null, "", `?${searchParams.toString()}`);
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
