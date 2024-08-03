import { PerspectiveCamera } from "three";
import { clamp } from "../clamp";
import { Store } from "../jotai-types";
import { degToRad } from "../rotations";
import { lookScaleAtom } from "../settings";
import styles from "./LookControls.module.css";

export function LookControls(
  camera: PerspectiveCamera,
  canvas: HTMLElement,
  store: Store
) {
  const maxElevation = degToRad(90);
  const minElevation = degToRad(-90);

  let prevClientX = 0;
  let prevClientY = 0;

  const onPointerDown = (event: PointerEvent) => {
    prevClientX = event.clientX;
    prevClientY = event.clientY;

    canvas.setPointerCapture(event.pointerId);

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.classList.add(styles.lookControlsActive);
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
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.classList.remove(styles.lookControlsActive);
  };

  return {
    enable: () => {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.classList.add(styles.lookControls);
    },

    disable: () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.classList.remove(styles.lookControls, styles.lookControlsActive);
    },
  };
}
