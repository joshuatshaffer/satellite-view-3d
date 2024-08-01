import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import * as satellite from "satellite.js";
import { degToRad } from "./rotations";

const localStoragePrefix = "satellite-view-3d/";

export const backgroundSettingValues = ["cameraPassthrough", "none"] as const;
export type BackgroundSetting = (typeof backgroundSettingValues)[number];

export const backgroundSettingAtom = atomWithStorage<BackgroundSetting>(
  localStoragePrefix + "background",
  "none"
);

export const viewControlSettingValues = [
  "deviceOrientation",
  "manual",
] as const;
export type ViewControlSetting = (typeof viewControlSettingValues)[number];

export const viewControlSettingAtom = atomWithStorage<ViewControlSetting>(
  localStoragePrefix + "view-control",
  "manual"
);

export const observerPositionModes = ["currentPosition", "manual"] as const;
export type ObserverPositionMode = (typeof observerPositionModes)[number];

export const observerPositionModeAtom = atomWithStorage<ObserverPositionMode>(
  localStoragePrefix + "observer-position-mode",
  "currentPosition"
);

const observerPositionSavedAtom = atomWithStorage<{
  latitude: number;
  longitude: number;
  height: number;
}>(localStoragePrefix + "observer-position", {
  latitude: 0,
  longitude: 0,
  height: 0,
});

export const geolocationAtom = atom<
  GeolocationPosition | GeolocationPositionError | null
>(null);

geolocationAtom.onMount = (set) => {
  const watchId = window.navigator.geolocation.watchPosition(
    (position) => {
      set(position);
    },
    (error) => {
      set(error);
    },
    {
      enableHighAccuracy: true,
    }
  );

  return () => {
    window.navigator.geolocation.clearWatch(watchId);
  };
};

interface ObserverPosition {
  latitude: number;
  longitude: number;
  height: number;
}

export const observerPositionAtom = atom(
  (get): ObserverPosition => {
    const mode = get(observerPositionModeAtom);

    if (mode === "currentPosition") {
      const position = get(geolocationAtom);
      if (position && "coords" in position) {
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          height: position.coords.altitude
            ? position.coords.altitude / 1000
            : 0,
        };
      }
    }

    return get(observerPositionSavedAtom);
  },
  (get, set, update: (prev: ObserverPosition) => ObserverPosition) => {
    set(observerPositionSavedAtom, update(get(observerPositionAtom)));
    set(observerPositionModeAtom, "manual");
  }
);

export const observerGdAtom = atom<satellite.GeodeticLocation>((get) => {
  const x = get(observerPositionAtom);
  return {
    latitude: degToRad(x.latitude),
    longitude: degToRad(x.longitude),
    height: x.height / 1000,
  };
});
