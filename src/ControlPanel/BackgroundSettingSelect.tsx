import { useAtom } from "jotai";
import { backgroundSettingAtom, backgroundSettingValues } from "../settings";
import { SelectField } from "./SelectField";

export function BackgroundSettingSelect() {
  const [background, setBackground] = useAtom(backgroundSettingAtom);

  return (
    <SelectField
      label="Background"
      options={backgroundSettingValues}
      getOptionLabel={(option) =>
        ({
          none: "None",
          cameraPassthrough: "Camera Passthrough",
        }[option])
      }
      value={background}
      onChange={setBackground}
    />
  );
}
