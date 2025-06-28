import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from "three";
import { SatellitePositions } from "./SatellitePositions/SatellitePositions";

export function makeSatellitePoints(satellitePositions: SatellitePositions) {
  const points = new Points(
    new BufferGeometry(),
    new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
  );

  points.geometry.setAttribute(
    "position",
    new BufferAttribute(satellitePositions.scenePositions, 3)
  );
  points.geometry.setDrawRange(0, satellitePositions.indexToId.size);

  const dependencyRef = {
    needsUpdate: false,
  };

  satellitePositions.dependents.add(dependencyRef);

  const dispose = () => {
    satellitePositions.dependents.delete(dependencyRef);
    points.geometry.dispose();
    points.material.dispose();
  };

  const update = () => {
    if (!dependencyRef.needsUpdate) {
      return;
    }
    dependencyRef.needsUpdate = false;

    if (
      points.geometry.attributes.position.array !==
      satellitePositions.scenePositions
    ) {
      console.log("Recreating geometry");
      points.geometry.dispose();
      points.geometry = new BufferGeometry();
      points.geometry.setAttribute(
        "position",
        new BufferAttribute(satellitePositions.scenePositions, 3)
      );
    }

    points.geometry.setDrawRange(0, satellitePositions.indexToId.size);
    points.geometry.attributes.position.needsUpdate = true;
  };

  return { points, update, dispose };
}
