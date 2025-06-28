import { useAtomValue } from "jotai";
import { CameraPassthrough } from "./CameraPassthrough";
import { SatelliteDetails } from "./SatelliteDetails";
import { backgroundSettingAtom } from "./settings";
import { SkyViewRenderer } from "./SkyViewRenderer";
import { UiOverlay } from "./UiOverlay/UiOverlay";

export function FirstPersonSkyView() {
  const background = useAtomValue(backgroundSettingAtom);

  return (
    <>
      {background === "cameraPassthrough" ? <CameraPassthrough /> : null}
      <SkyViewRenderer />
      <SatelliteDetails />
      <UiOverlay />
    </>
  );
}
