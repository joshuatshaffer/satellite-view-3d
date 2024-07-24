import { addWarning } from "./warnings";

type DeviceOrientationEventIos = typeof DeviceOrientationEvent & {
  requestPermission: (absolute: boolean) => Promise<"granted" | "denied">;
};

export let orientation: DeviceOrientationEvent | null = null;
const disableDeviceOrientationNullWarning = addWarning(
  "Device orientation not yet available."
);

function init() {
  if (!("DeviceOrientationEvent" in window)) {
    alert(
      "This app does not work without absolute device orientation. DeviceOrientationEvent is not supported."
    );
    return;
  }

  if (
    typeof (DeviceOrientationEvent as DeviceOrientationEventIos)
      .requestPermission === "function"
  ) {
    (DeviceOrientationEvent as DeviceOrientationEventIos)
      .requestPermission(true)
      .then((response) => {
        if (response === "denied") {
          alert(
            "This app does not work without absolute device orientation. Permission was denied."
          );
        }
      });
  }

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (orientation?.absolute && !event.absolute) return;
    orientation = event;
    disableDeviceOrientationNullWarning();
  };

  window.addEventListener("deviceorientation", onDeviceOrientation);

  window.addEventListener(
    "deviceorientationabsolute",
    (event: DeviceOrientationEvent) => {
      orientation = event;
      disableDeviceOrientationNullWarning();

      window.removeEventListener("deviceorientation", onDeviceOrientation);
    }
  );
}

init();
