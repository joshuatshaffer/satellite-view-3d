import { PerspectiveCamera } from "three";
import { degToRad } from "../rotations";
import styles from "./DragControls.module.css";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function DragControls(
  camera: PerspectiveCamera,
  domElement: HTMLElement
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

    camera.rotation.set(
      clamp(
        camera.rotation.x +
          (deltaClientY / window.innerHeight) * degToRad(camera.fov),
        minElevation,
        maxElevation
      ),
      camera.rotation.y +
        (deltaClientX / window.innerWidth) * degToRad(camera.fov),
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
