import { useAtomValue } from "jotai";
import { CameraPassthrough } from "./CameraPassthrough";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { backgroundSettingAtom } from "./settings";
import { useWarnings } from "./warnings";

export function App() {
  const warnings = useWarnings();

  const background = useAtomValue(backgroundSettingAtom);

  return (
    <>
      {background === "cameraPassthrough" ? <CameraPassthrough /> : null}
      <ControlPanel />
      <ul>
        {warnings.map((warning) => (
          <li>{warning}</li>
        ))}
      </ul>
    </>
  );
}
