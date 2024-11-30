import { useAtomValue } from "jotai";
import { ArOverlay } from "./ArOverlay";
import { CameraPassthrough } from "./CameraPassthrough";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { SatelliteDetails } from "./SatelliteDetails";
import { backgroundSettingAtom } from "./settings";

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
