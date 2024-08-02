import { PerspectiveCamera } from "three";
import { clamp } from "../clamp";
import { Store } from "../jotai-types";
import { degToRad } from "../rotations";
import { lookScaleAtom } from "../settings";
import styles from "./LookControls.module.css";

export function LookControls(
  camera: PerspectiveCamera,
  domElement: HTMLElement,
  store: Store
) {
  const maxElevation = degToRad(90);
  const minElevation = degToRad(-90);

  let prevClientX = 0;
  let prevClientY = 0;

  const onPointerDown = (event: PointerEvent) => {
    prevClientX = event.clientX;
    prevClientY = event.clientY;

    domElement.setPointerCapture(event.pointerId);

    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("pointerup", onPointerUp);
    domElement.classList.add(styles.lookControlsActive);
  };

  const onPointerMove = (event: PointerEvent) => {
    const deltaClientX = event.clientX - prevClientX;
    const deltaClientY = event.clientY - prevClientY;
    prevClientX = event.clientX;
    prevClientY = event.clientY;
    const lookScale = store.get(lookScaleAtom);

    camera.rotation.set(
      clamp(
        camera.rotation.x -
          (deltaClientY / window.innerHeight) *
            degToRad(camera.fov) *
            lookScale,
        minElevation,
        maxElevation
      ),
      camera.rotation.y -
        (deltaClientX / window.innerWidth) * degToRad(camera.fov) * lookScale,
      0,
      "YXZ"
    );
  };

  const onPointerUp = (_event: PointerEvent) => {
    domElement.removeEventListener("pointermove", onPointerMove);
    domElement.removeEventListener("pointerup", onPointerUp);
    domElement.classList.remove(styles.lookControlsActive);
  };

  return {
    enable: () => {
      domElement.addEventListener("pointerdown", onPointerDown);
      domElement.classList.add(styles.lookControls);
    },

    disable: () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", onPointerUp);
      domElement.classList.remove(
        styles.lookControls,
        styles.lookControlsActive
      );
    },
  };
}
