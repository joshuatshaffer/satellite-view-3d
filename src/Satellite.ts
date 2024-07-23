import * as satellite from "satellite.js";
import { Euler, Object3D, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { observerGd } from "./observer";
import { north } from "./sceneSpaceDirections";

export class Satellite {
  public readonly object3D = new Object3D();

  private satrec: satellite.SatRec;
  private positionEcf: satellite.EcfVec3<number> | null = null;
  private lookAngles: satellite.LookAngles | null = null;
  private worldPosition: Vector3 | null = null;

  constructor(public displayName: string, tleLine1: string, tleLine2: string) {
    this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    const text = document.createElement("div");
    text.className = "label";
    text.textContent = "ISS";

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    this.object3D.add(label);
  }

  updatePosition(now = new Date()) {
    const positionAndVelocity = satellite.propagate(this.satrec, now);

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    const positionEci = positionAndVelocity.position;
    if (typeof positionEci !== "object") {
      this.positionEcf = null;
      return;
    }

    this.positionEcf = satellite.eciToEcf(positionEci, satellite.gstime(now));
  }

  updateLookAngles() {
    if (this.positionEcf === null) {
      this.lookAngles = null;
      this.worldPosition = null;
      return;
    }

    this.lookAngles = satellite.ecfToLookAngles(observerGd, this.positionEcf);
    this.worldPosition = north()
      .applyEuler(
        new Euler(this.lookAngles.elevation, -this.lookAngles.azimuth, 0)
      )
      .multiplyScalar(100);
  }

  update() {
    this.updatePosition();
    this.updateLookAngles();

    if (this.worldPosition === null) {
      return;
    }

    this.object3D.position.copy(this.worldPosition);
  }
}
