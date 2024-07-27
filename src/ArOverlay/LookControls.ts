import { Camera } from "three";
import { degToRad } from "../rotations";
import styles from "./LookControls.module.css";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function LookControls(camera: Camera, domElement: HTMLElement) {
  const movementScale = 0.01;

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

    camera.rotation.set(
      clamp(
        camera.rotation.x - deltaClientY * movementScale,
        minElevation,
        maxElevation
      ),
      camera.rotation.y - deltaClientX * movementScale,
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
