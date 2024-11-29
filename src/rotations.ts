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
    degToRad(orientation.beta ?? 0),
    degToRad(orientation.gamma ?? 0),
    degToRad(orientation.alpha ?? 0),
    "ZXY"
  );
}

const devicePhysicalCameraQuaternion = Object.freeze(
  new Quaternion().setFromEuler(new Euler(degToRad(-90), 0, 0, "XYZ"))
);

export function deviceOrientationToCameraQuaternion(
  orientation: DeviceOrientation,
  screenOrientation?: ScreenOrientation,
  quaternion = new Quaternion()
) {
  quaternion.setFromEuler(deviceOrientationToEuler(orientation));

  quaternion.premultiply(devicePhysicalCameraQuaternion);

  const screenAngle = screenOrientation?.angle;
  if (screenAngle !== undefined && screenAngle !== 0) {
    quaternion.multiply(
      new Quaternion().setFromEuler(
        new Euler(0, 0, -degToRad(screenAngle), "XYZ")
      )
    );
  }

  return quaternion;
}

export function deviceOrientationToLookAngles(orientation: DeviceOrientation) {
  const quaternion = deviceOrientationToCameraQuaternion(orientation);

  const euler = new Euler().setFromQuaternion(quaternion, "YXZ");

  return {
    /**
     * Degrees from north. 0 is north, 90 is east, 180 is south, 270 is west.
     */
    azimuth: -radToDeg(euler.y),

    /**
     * Degrees above the horizon. 0 is astronomical horizon, 90 is up, -90 is down.
     */
    elevation: radToDeg(euler.x),

    roll: radToDeg(euler.z),
  };
}
