import { useAtom } from "jotai";
import { isElementOf } from "../isElementOf";
import { viewControlSettingAtom, viewControlSettingValues } from "../settings";

export function ViewControlSettingSelect() {
  const [viewControlSetting, setViewControlSetting] = useAtom(
    viewControlSettingAtom
  );

  return (
    <div>
      <label>View Control </label>
      <select
        value={viewControlSetting}
        onChange={(event) => {
          const newValue = event.target.value;

          if (!isElementOf(viewControlSettingValues, newValue)) {
            throw new Error("Invalid background setting");
          }

          setViewControlSetting(newValue);
        }}
      >
        <option value="deviceOrientation">Device Orientation</option>
        <option value="manual">Manual</option>
      </select>
    </div>
  );
}
