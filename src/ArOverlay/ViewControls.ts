import { PerspectiveCamera } from "three";
import { Store } from "../jotai-types";
import { viewControlSettingAtom } from "../settings";
import { DeviceOrientationControls } from "./DeviceOrientationControls";
import { DragControls } from "./DragControls";
import { LookControls } from "./LookControls";

export function ViewControls({
  camera,
  domElement,
  store,
}: {
  camera: PerspectiveCamera;
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
    drag: DragControls(camera, domElement),
    look: LookControls(camera, domElement),
    deviceOrientation: DeviceOrientationControls(camera),
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
