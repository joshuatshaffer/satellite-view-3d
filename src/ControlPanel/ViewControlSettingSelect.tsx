import { useAtom } from "jotai";
import { viewControlSettingAtom, viewControlSettingValues } from "../settings";
import { SelectField } from "./SelectField";

export function ViewControlSettingSelect() {
  const [viewControlSetting, setViewControlSetting] = useAtom(
    viewControlSettingAtom
  );

  return (
    <SelectField
      label="View Control"
      options={viewControlSettingValues}
      getOptionLabel={(option) =>
        ({
          drag: "Drag",
          look: "Look",
          deviceOrientation: "Device Orientation",
        }[option])
      }
      value={viewControlSetting}
      onChange={setViewControlSetting}
    />
  );
}
