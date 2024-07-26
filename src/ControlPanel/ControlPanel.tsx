import { BackgroundSettingSelect } from "./BackgroundSettingSelect";
import { ViewControlSettingSelect } from "./ViewControlSettingSelect";

export function ControlPanel() {
  return (
    <details style={{ padding: "0.5em" }}>
      <summary>Control Panel</summary>
      <BackgroundSettingSelect />
      <ViewControlSettingSelect />
    </details>
  );
}
