import { Camera } from "three";
import { deviceOrientationToCameraQuaternion } from "./rotations";

// TODO: Support Safari and iOS with `webkitCompassHeading`.
//       https://developer.apple.com/documentation/webkitjs/deviceorientationevent#1676398
//
// TODO: Look into using WebXR.
//       https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API
export function makeDeviceOrientationControls(camera: Camera) {
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
