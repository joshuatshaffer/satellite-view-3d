import { PerspectiveCamera } from "three";
import { clamp } from "../clamp";
import { Store } from "../jotai-types";
import { degToRad } from "../rotations";
import { dragScaleAtom } from "../settings";
import styles from "./DragControls.module.css";

export function DragControls(
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
    domElement.classList.add(styles.dragControlsActive);
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
    domElement.removeEventListener("pointermove", onPointerMove);
    domElement.removeEventListener("pointerup", onPointerUp);
    domElement.classList.remove(styles.dragControlsActive);
  };

  return {
    enable: () => {
      domElement.addEventListener("pointerdown", onPointerDown);
      domElement.classList.add(styles.dragControls);
    },

    disable: () => {
      domElement.removeEventListener("pointerdown", onPointerDown);
      domElement.removeEventListener("pointermove", onPointerMove);
      domElement.removeEventListener("pointerup", onPointerUp);
      domElement.classList.remove(
        styles.dragControls,
        styles.dragControlsActive
      );
    },
  };
}
