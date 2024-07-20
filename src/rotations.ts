import { Euler, Quaternion } from "three";

export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

type DeviceOrientation = Pick<
  DeviceOrientationEvent,
  "alpha" | "beta" | "gamma"
>;

export function deviceOrientationToEuler(orientation: DeviceOrientation) {
  return new Euler(
    degToRad(orientation.beta || 0),
    degToRad(orientation.gamma || 0),
    degToRad(orientation.alpha || 0),
    "ZXY"
  );
}

export function deviceOrientationToQuaternion(orientation: DeviceOrientation) {
  return new Quaternion().setFromEuler(deviceOrientationToEuler(orientation));
}

export function deviceOrientationToLookAngles(orientation: DeviceOrientation) {
  const quaternion = deviceOrientationToQuaternion(orientation);

  const euler = new Euler();
  euler.setFromQuaternion(quaternion, "ZXY");

  return {
    azimuth: radToDeg(euler.y),
    elevation: radToDeg(euler.x),
    roll: radToDeg(euler.z),
  };
}
