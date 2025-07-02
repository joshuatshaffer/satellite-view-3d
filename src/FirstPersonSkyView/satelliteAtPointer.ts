import { Camera, Matrix4, Vector3 } from "three";
import type { NoradId } from "../satdb/db";
import { PointerPosition } from "./inputs";
import { Store } from "./jotai-types";
import { ndcInView } from "./ndcInView";
import { SatellitePositions } from "./SatellitePositions/SatellitePositions";
import { searchResultsAtom } from "./UiOverlay/Search/Search";

const maxDistance = 20;
const maxDistanceSq = maxDistance * maxDistance;

export function satelliteAtPointer({
  pointerPosition,
  satellitePositions,
  camera,
  canvas,
  store,
}: {
  pointerPosition: PointerPosition;
  satellitePositions: SatellitePositions;
  camera: Camera;
  canvas: HTMLCanvasElement;
  store: Store;
}) {
  let closestId: NoradId | undefined;
  let closestDistanceSq = Infinity;

  // Pre-compute the matrix for efficiency instead of using
  // `satellitePosition.project(camera)`.
  const sceneSpaceToNdc = new Matrix4()
    .multiply(camera.projectionMatrix)
    .multiply(camera.matrixWorldInverse);

  const positionInNdc = new Vector3();

  for (const { noradId } of store.get(searchResultsAtom)) {
    const i = satellitePositions.idToIndex.get(noradId);
    if (i === undefined) {
      continue;
    }

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
      closestId = noradId;
    }
  }

  return closestId;
}
