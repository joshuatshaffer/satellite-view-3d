import { Euler } from "three";
import { north } from "./sceneSpaceDirections";

export interface LookAngles {
  azimuth: number;
  elevation: number;
}

function lookAnglesToEuler(lookAngles: LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}

export function lookAnglesToPosition(lookAngles: LookAngles, radius: number) {
  return north()
    .applyEuler(lookAnglesToEuler(lookAngles))
    .multiplyScalar(radius);
}
