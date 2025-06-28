import { useState } from "react";
import { FaGear } from "react-icons/fa6";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import styles from "./UiOverlay.module.css";

export function UiOverlay() {
  const [activeTab, setActiveTab] = useState<"search" | "controlPanel" | null>(
    null
  );

  return (
    <div className={styles.uiOverlay}>
      <div className={styles.menuBar}>
        <button
          type="button"
          className={styles.tabButton}
          aria-selected={activeTab === "controlPanel"}
          onClick={() => {
            setActiveTab(activeTab === "controlPanel" ? null : "controlPanel");
          }}
        >
          <FaGear size={16} />
        </button>
      </div>
      {activeTab === "controlPanel" ? <ControlPanel /> : null}
    </div>
  );
}
