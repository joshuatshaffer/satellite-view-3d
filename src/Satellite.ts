import * as satellite from "satellite.js";
import {
  BufferGeometry,
  Euler,
  Line,
  LineBasicMaterial,
  Object3D,
  Vector3,
} from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { observerGd } from "./observer";
import { north } from "./sceneSpaceDirections";

export class Satellite {
  public readonly object3D = new Object3D();

  private satrec: satellite.SatRec;
  private positionEcf: satellite.EcfVec3<number> | null = null;
  private worldPosition: Vector3 | null = null;

  public nextPassLine: Line | null = null;

  constructor(public displayName: string, tleLine1: string, tleLine2: string) {
    this.satrec = satellite.twoline2satrec(tleLine1, tleLine2);

    this.update();

    const text = document.createElement("div");
    text.className = "label";
    text.textContent = this.displayName;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    this.object3D.add(label);

    this.object3D.visible = false;

    const nextPasses = this.findNextPass();
    for (const nextPass of nextPasses) {
      this.nextPassLine = new Line(
        new BufferGeometry().setFromPoints(
          nextPass.map(({ lookAngles }) =>
            north()
              .applyEuler(lookAnglesToEuler(lookAngles))
              .multiplyScalar(100)
          )
        ),
        new LineBasicMaterial({ color: 0xff0000 })
      );
    }
  }

  findNextPass({
    startTimeDate = new Date(),
    maxSearchTimeMs = 10 * days,
    timeStepMs = 1 * seconds,
    maxPasses = 1,
  } = {}) {
    let timeUnixMs = startTimeDate.valueOf();
    const endTimeUnixMs = timeUnixMs + maxSearchTimeMs;

    const passes: {
      time: number;
      lookAngles: satellite.LookAngles;
    }[][] = [];

    let state:
      | { status: "searching" }
      | {
          status: "scanning";
          passPoints: {
            time: number;
            lookAngles: satellite.LookAngles;
          }[];
        } = {
      status: "searching",
    };

    // Search for the beginning of the next pass.
    for (; timeUnixMs < endTimeUnixMs; timeUnixMs += timeStepMs) {
      const timeDate = new Date(timeUnixMs);
      const positionAndVelocity = satellite.propagate(this.satrec, timeDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        if (state.status === "scanning") {
          passes.push(state.passPoints);
          state = { status: "searching" };
        }
        break;
      }

      const positionEcf = satellite.eciToEcf(
        positionEci,
        satellite.gstime(timeDate)
      );

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      if (state.status === "searching") {
        if (lookAngles.elevation > 0) {
          state = {
            status: "scanning",
            passPoints: [{ time: timeUnixMs, lookAngles }],
          };
        }
      } else {
        state.passPoints.push({ time: timeUnixMs, lookAngles });
        if (lookAngles.elevation < 0) {
          passes.push(state.passPoints);
          state = { status: "searching" };
          if (passes.length >= maxPasses) {
            break;
          }
        }
      }
    }

    return passes;
  }

  private updatePosition(now = new Date()) {
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

  private updateLookAngles() {
    if (this.positionEcf === null) {
      this.worldPosition = null;
      this.object3D.visible = false;
      return;
    }

    const lookAngles = satellite.ecfToLookAngles(observerGd, this.positionEcf);

    // console.log(this.displayName, {
    //   azimuth: radToDeg(lookAngles.azimuth),
    //   elevation: radToDeg(lookAngles.elevation),
    // });

    this.worldPosition = north()
      .applyEuler(lookAnglesToEuler(lookAngles))
      .multiplyScalar(100);
    this.object3D.visible = true;
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

function lookAnglesToEuler(lookAngles: satellite.LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}

const seconds = 1000;
const minutes = 60 * seconds;
const hours = 60 * minutes;
const days = 24 * hours;
