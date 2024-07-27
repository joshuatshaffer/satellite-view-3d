import { useAtomValue } from "jotai";
import { ArOverlay } from "./ArOverlay";
import { CameraPassthrough } from "./CameraPassthrough";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { backgroundSettingAtom } from "./settings";

export function App() {
  const background = useAtomValue(backgroundSettingAtom);

  return (
    <>
      {background === "cameraPassthrough" ? <CameraPassthrough /> : null}
      <ArOverlay />
      <ControlPanel />
    </>
  );
}
