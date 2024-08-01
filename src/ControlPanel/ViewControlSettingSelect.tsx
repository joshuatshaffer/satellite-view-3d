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
          deviceOrientation: "Device Orientation",
          manual: "Manual",
        }[option])
      }
      value={viewControlSetting}
      onChange={setViewControlSetting}
    />
  );
}
