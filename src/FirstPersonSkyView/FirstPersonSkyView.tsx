import { useAtomValue } from "jotai";
import { CameraPassthrough } from "./CameraPassthrough";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { SatelliteDetails } from "./SatelliteDetails";
import { backgroundSettingAtom } from "./settings";
import { ArOverlay } from "./SkyViewRenderer";

export function FirstPersonSkyView() {
  const background = useAtomValue(backgroundSettingAtom);

  return (
    <>
      {background === "cameraPassthrough" ? <CameraPassthrough /> : null}
      <ArOverlay />
      <SatelliteDetails />
      <ControlPanel />
    </>
  );
}
