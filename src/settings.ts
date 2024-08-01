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

export const observerPositionAtom = atomWithStorage<{
  latitude: number;
  longitude: number;
  height: number;
}>(localStoragePrefix + "observer-position", {
  latitude: 0,
  longitude: 0,
  height: 0,
});

observerPositionAtom.onMount = (set) => {
  const watchId = window.navigator.geolocation.watchPosition((newPosition) => {
    set({
      latitude: newPosition.coords.latitude,
      longitude: newPosition.coords.longitude,
      height:
        newPosition.coords.altitude !== null ? newPosition.coords.altitude : 0,
    });
  });

  return () => {
    window.navigator.geolocation.clearWatch(watchId);
  };
};

export const observerGdAtom = atom<satellite.GeodeticLocation>((get) => {
  const { latitude, longitude, height } = get(observerPositionAtom);
  return {
    latitude: degToRad(latitude),
    longitude: degToRad(longitude),
    height: height / 1000,
  };
});
