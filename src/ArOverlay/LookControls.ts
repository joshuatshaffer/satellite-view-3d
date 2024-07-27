import { Camera } from "three";
import { degToRad } from "../rotations";
import styles from "./LookControls.module.css";

export function LookControls(camera: Camera, domElement: HTMLElement) {
  const onPointerDown = (event: PointerEvent) => {
    domElement.setPointerCapture(event.pointerId);

    domElement.addEventListener("pointermove", onPointerMove);
    domElement.addEventListener("pointerup", onPointerUp);
    domElement.classList.add(styles.lookControlsActive);
  };

  const onPointerMove = (event: PointerEvent) => {
    const { movementX, movementY } = event;

    camera.rotation.set(
      Math.max(
        -degToRad(90),
        Math.min(degToRad(90), camera.rotation.x - movementY * 0.01)
      ),
      camera.rotation.y - movementX * 0.01,
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
