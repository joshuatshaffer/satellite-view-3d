import {
  BufferGeometry,
  LineBasicMaterial,
  LineLoop,
  Object3D,
  Vector3,
} from "three";
import { degToRad } from "./rotations";
import { radii } from "./scenePositions";

export function makeGrid() {
  const gridRoot = new Object3D();

  const majorLineMaterial = new LineBasicMaterial({ color: "#00b" });
  const minorLineMaterial = new LineBasicMaterial({ color: "#2b2b2b" });

  const numberOfVertices = 100;

  const loop = new BufferGeometry().setFromPoints(
    Array.from({ length: numberOfVertices }, (_, i) => {
      const theta = (Math.PI * 2 * i) / numberOfVertices;

      return new Vector3(
        Math.cos(theta) * radii.gridLine,
        0,
        Math.sin(theta) * radii.gridLine
      );
    })
  );

  const majorElevationLineDeg = 30;
  const minorElevationLineDeg = 10;
  const numberOfElevationLines = 180 / minorElevationLineDeg - 1;
  for (let i = 0; i < numberOfElevationLines; i++) {
    const elevationDeg =
      (i - Math.floor(numberOfElevationLines / 2)) * minorElevationLineDeg;
    const elevation = degToRad(elevationDeg);

    const line = new LineLoop(
      loop,
      elevationDeg % majorElevationLineDeg === 0
        ? majorLineMaterial
        : minorLineMaterial
    );

    const scale = Math.cos(elevation);

    line.scale.set(scale, 1, scale);
    line.position.y = Math.sin(elevation) * radii.gridLine;

    gridRoot.add(line);
  }

  const majorAzimuthLineDeg = 90;
  const minorAzimuthLineDeg = 10;
  const numberOfAzimuthLines = 180 / minorAzimuthLineDeg;
  for (let i = 0; i < numberOfAzimuthLines; i++) {
    const azimuthDeg = i * minorAzimuthLineDeg;
    const azimuth = degToRad(azimuthDeg);

    const line = new LineLoop(
      loop,
      azimuthDeg % majorAzimuthLineDeg === 0
        ? majorLineMaterial
        : minorLineMaterial
    );

    line.rotation.x = degToRad(90);
    line.rotation.z = azimuth;

    gridRoot.add(line);
  }

  return gridRoot;
}
