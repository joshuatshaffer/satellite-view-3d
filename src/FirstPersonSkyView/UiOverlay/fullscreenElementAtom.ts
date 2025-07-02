import { atom } from "jotai";

const internalAtom = atom(document.fullscreenElement);

internalAtom.onMount = (set) => {
  const listener = () => {
    set(document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", listener);

  return () => {
    document.removeEventListener("fullscreenchange", listener);
  };
};

export const fullscreenElementAtom = atom(
  (get) => get(internalAtom),
  (_get, _set, element: Element | null) => {
    if (element) {
      return element.requestFullscreen();
    } else {
      return document.exitFullscreen();
    }
  }
);

export const fullscreenBodyAtom = atom(
  (get) => get(fullscreenElementAtom) === document.body,
  (_get, set, isFullscreen: boolean) =>
    set(fullscreenElementAtom, isFullscreen ? document.body : null)
);
