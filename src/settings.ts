import { atomWithStorage } from "jotai/utils";

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
