import { BufferAttribute, BufferGeometry, Points, PointsMaterial } from "three";
import { SatellitePositions } from "./SatellitePositions";

export class SatellitePoints {
  public needsUpdate = false;

  public readonly points = new Points(
    new BufferGeometry(),
    new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
  );

  constructor(private readonly satellitePositions: SatellitePositions) {
    this.points.geometry.setAttribute(
      "position",
      new BufferAttribute(this.satellitePositions.scenePositions, 3)
    );
    this.points.geometry.setDrawRange(
      0,
      this.satellitePositions.indexToId.size
    );

    this.satellitePositions.dependents.add(this);
  }

  dispose() {
    this.satellitePositions.dependents.delete(this);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }

  update() {
    if (!this.needsUpdate) {
      return;
    }
    this.needsUpdate = false;

    if (
      this.points.geometry.attributes.position.array !==
      this.satellitePositions.scenePositions
    ) {
      console.log("Recreating geometry");
      this.points.geometry.dispose();
      this.points.geometry = new BufferGeometry();
      this.points.geometry.setAttribute(
        "position",
        new BufferAttribute(this.satellitePositions.scenePositions, 3)
      );
    }

    this.points.geometry.setDrawRange(
      0,
      this.satellitePositions.indexToId.size
    );
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
