import { atomWithStorage } from "jotai/utils";

const localStoragePrefix = "satellite-view-3d/";

export const backgroundSettingAtom = atomWithStorage<
  "cameraPassthrough" | "none"
>(localStoragePrefix + "background", "none");
