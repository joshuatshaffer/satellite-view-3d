import { BackgroundSettingSelect } from "./BackgroundSettingSelect";

export function ControlPanel() {
  return (
    <details style={{ padding: "0.5em" }}>
      <summary>Control Panel</summary>
      <BackgroundSettingSelect />
    </details>
  );
}
