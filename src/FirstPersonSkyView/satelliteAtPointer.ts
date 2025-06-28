import { Camera, Matrix4, Vector3 } from "three";
import { PointerPosition } from "./inputs";
import { ndcInView } from "./ndcInView";
import { SatellitePositions } from "./SatellitePositions/SatellitePositions";

const maxDistance = 20;
const maxDistanceSq = maxDistance * maxDistance;

export function satelliteAtPointer({
  pointerPosition,
  satellitePositions,
  camera,
  canvas,
}: {
  pointerPosition: PointerPosition;
  satellitePositions: SatellitePositions;
  camera: Camera;
  canvas: HTMLCanvasElement;
}) {
  let closestIndex: number | undefined;
  let closestDistanceSq = Infinity;

  // Pre-compute the matrix for efficiency instead of using
  // `satellitePosition.project(camera)`.
  const sceneSpaceToNdc = new Matrix4()
    .multiply(camera.projectionMatrix)
    .multiply(camera.matrixWorldInverse);

  const positionInNdc = new Vector3();

  for (let i = 0; i < satellitePositions.indexToId.size; i++) {
    positionInNdc
      .set(
        satellitePositions.scenePositions[i * 3],
        satellitePositions.scenePositions[i * 3 + 1],
        satellitePositions.scenePositions[i * 3 + 2]
      )
      .applyMatrix4(sceneSpaceToNdc);

    if (!ndcInView(positionInNdc)) {
      continue;
    }

    const dx =
      (1 + positionInNdc.x) * (canvas.offsetWidth / 2) -
      pointerPosition.offsetX;
    const dy =
      (1 - positionInNdc.y) * (canvas.offsetHeight / 2) -
      pointerPosition.offsetY;

    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < maxDistanceSq && distanceSq < closestDistanceSq) {
      closestDistanceSq = distanceSq;
      closestIndex = i;
    }
  }

  return closestIndex
    ? satellitePositions.indexToId.get(closestIndex)
    : undefined;
}
