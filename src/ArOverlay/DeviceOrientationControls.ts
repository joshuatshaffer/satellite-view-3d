import { Camera } from "three";
import { deviceOrientationToCameraQuaternion } from "../rotations";

export function DeviceOrientationControls(camera: Camera) {
  let deviceOrientation: DeviceOrientationEvent | undefined;

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    deviceOrientation = event;
  };

  return {
    enable: () => {
      window.addEventListener("deviceorientationabsolute", onDeviceOrientation);
    },

    disable: () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        onDeviceOrientation
      );
      deviceOrientation = undefined;
    },

    update: () => {
      if (deviceOrientation) {
        deviceOrientationToCameraQuaternion(
          deviceOrientation,
          camera.quaternion
        );
      }
    },
  };
}
