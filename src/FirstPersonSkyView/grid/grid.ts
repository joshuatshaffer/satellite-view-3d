import { Object3D, PerspectiveCamera } from "three";
import { makeGridLabels } from "./gridLabels";
import { makeGridLines } from "./gridLines";
import { makeCardinalDirectionLabels } from "./makeCardinalDirectionLabels";

export function makeGrid(camera: PerspectiveCamera) {
  const gridRoot = new Object3D();

  makeGridLines(gridRoot);
  const gridLabels = makeGridLabels(gridRoot, camera);
  makeCardinalDirectionLabels(gridRoot);

  return {
    gridRoot,
    update: () => {
      gridLabels.update();
    },
  };
}
