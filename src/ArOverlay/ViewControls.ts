import { Camera } from "three";
import { Store } from "../jotai-types";
import { viewControlSettingAtom } from "../settings";
import { DeviceOrientationControls } from "./DeviceOrientationControls";
import { LookControls } from "./LookControls";

export function ViewControls({
  camera,
  domElement,
  store,
}: {
  camera: Camera;
  domElement: HTMLElement;
  store: Store;
}) {
  let activeControls:
    | {
        enable: () => void;
        disable: () => void;
        update?: () => void;
      }
    | undefined;

  const controlsMap = {
    deviceOrientation: DeviceOrientationControls(camera),
    manual: LookControls(camera, domElement),
  };

  const updateActiveControls = () => {
    activeControls?.disable();
    activeControls = controlsMap[store.get(viewControlSettingAtom)];
    activeControls?.enable();
  };

  let unSub: (() => void) | undefined;

  return {
    enable: () => {
      updateActiveControls();
      unSub = store.sub(viewControlSettingAtom, updateActiveControls);
    },

    disable: () => {
      unSub?.();
      activeControls?.disable();
      activeControls = undefined;
    },

    update: () => {
      activeControls?.update?.();
    },
  };
}
