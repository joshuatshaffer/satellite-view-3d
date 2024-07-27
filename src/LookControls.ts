import { Camera } from "three";
import styles from "./LookControls.module.css";
import { degToRad } from "./rotations";

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

  domElement.addEventListener("pointerdown", onPointerDown);

  domElement.classList.add(styles.lookControls);

  return {
    dispose() {
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
