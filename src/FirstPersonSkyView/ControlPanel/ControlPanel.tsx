import { BackgroundSettings } from "./BackgroundSettings";
import styles from "./ControlPanel.module.css";
import { ObserverPositionSettings } from "./ObserverPositionSettings";
import { ViewControlSettings } from "./ViewControlSettings";

export function ControlPanel() {
  return (
    <details className={styles.controlPanel}>
      <summary>Control Panel</summary>
      <BackgroundSettings />
      <ViewControlSettings />
      <ObserverPositionSettings />
    </details>
  );
}
