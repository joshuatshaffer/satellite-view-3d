import { PerspectiveCamera } from "three";
import { clamp } from "../clamp";
import { Store } from "../jotai-types";
import { degToRad } from "../rotations";
import { dragScaleAtom } from "../settings";
import styles from "./DragControls.module.css";

export function DragControls(
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
    canvas.classList.add(styles.dragControlsActive);
  };

  const onPointerMove = (event: PointerEvent) => {
    const deltaClientX = event.clientX - prevClientX;
    const deltaClientY = event.clientY - prevClientY;
    prevClientX = event.clientX;
    prevClientY = event.clientY;
    const dragScale = store.get(dragScaleAtom);

    camera.rotation.set(
      clamp(
        camera.rotation.x +
          (deltaClientY / window.innerHeight) *
            degToRad(camera.fov) *
            dragScale,
        minElevation,
        maxElevation
      ),
      camera.rotation.y +
        (deltaClientX / window.innerWidth) * degToRad(camera.fov) * dragScale,
      0,
      "YXZ"
    );
  };

  const onPointerUp = (_event: PointerEvent) => {
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.classList.remove(styles.dragControlsActive);
  };

  return {
    enable: () => {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.classList.add(styles.dragControls);
    },

    disable: () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.classList.remove(styles.dragControls, styles.dragControlsActive);
    },
  };
}
