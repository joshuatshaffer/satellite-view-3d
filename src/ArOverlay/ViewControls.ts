import { PerspectiveCamera } from "three";
import { Store } from "../jotai-types";
import { viewControlModeAtom } from "../settings";
import { DeviceOrientationControls } from "./DeviceOrientationControls";
import { DragControls } from "./DragControls";
import { LookControls } from "./LookControls";

export function ViewControls({
  camera,
  canvas,
  store,
}: {
  camera: PerspectiveCamera;
  canvas: HTMLElement;
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
    drag: DragControls(camera, canvas, store),
    look: LookControls(camera, canvas, store),
    deviceOrientation: DeviceOrientationControls(camera),
  };

  const updateActiveControls = () => {
    activeControls?.disable();
    activeControls = controlsMap[store.get(viewControlModeAtom)];
    activeControls?.enable();
  };

  let unSub: (() => void) | undefined;

  return {
    enable: () => {
      updateActiveControls();
      unSub = store.sub(viewControlModeAtom, updateActiveControls);
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
