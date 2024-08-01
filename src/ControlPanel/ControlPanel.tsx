import { BackgroundSettingSelect } from "./BackgroundSettingSelect";
import styles from "./ControlPanel.module.css";
import { ObserverPosition } from "./ObserverPosition";
import { ViewControlSettingSelect } from "./ViewControlSettingSelect";

export function ControlPanel() {
  return (
    <details className={styles.controlPanel}>
      <summary>Control Panel</summary>
      <BackgroundSettingSelect />
      <ViewControlSettingSelect />
      <ObserverPosition />
    </details>
  );
}
