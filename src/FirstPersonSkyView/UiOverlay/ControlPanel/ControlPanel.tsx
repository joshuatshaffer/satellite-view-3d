import { BackgroundSettings } from "./BackgroundSettings";
import styles from "./ControlPanel.module.css";
import { ObserverPositionSettings } from "./ObserverPositionSettings";
import { ViewControlSettings } from "./ViewControlSettings";

export function ControlPanel() {
  return (
    <div className={styles.controlPanel}>
      <div>Control Panel</div>
      <BackgroundSettings />
      <ViewControlSettings />
      <ObserverPositionSettings />
    </div>
  );
}
