import { Vector3 } from "three";

export function ndcInView(positionInNdc: Vector3) {
  return (
    positionInNdc.z >= 0 &&
    positionInNdc.z <= 1 &&
    positionInNdc.x >= -1 &&
    positionInNdc.x <= 1 &&
    positionInNdc.y >= -1 &&
    positionInNdc.y <= 1
  );
}
