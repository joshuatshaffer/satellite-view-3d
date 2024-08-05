import { PerspectiveCamera } from "three";
import { clamp } from "./clamp";

export function makeInputs(
  canvas: HTMLCanvasElement,
  camera: PerspectiveCamera
) {
  let zoom = 1;

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    zoom = clamp(zoom - event.deltaY * 0.001, 1, 10);

    camera.zoom = zoom * zoom;
    camera.updateProjectionMatrix();
  };

  canvas.addEventListener("wheel", onWheel);

  return {
    dispose: () => {
      canvas.removeEventListener("wheel", onWheel);
    },
  };
}
