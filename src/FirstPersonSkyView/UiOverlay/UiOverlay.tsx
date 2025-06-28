import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { Search } from "./Search/Search";
import styles from "./UiOverlay.module.css";

type ObjectEntries<T> = { [P in keyof T]: [P, T[P]] }[keyof T][];

export function UiOverlay() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs | null>(null);

  const tabs = {
    search: {
      icon: <FaSearch size={16} />,
      panel: <Search />,
    },
    controlPanel: {
      icon: <FaGear size={16} />,
      panel: <ControlPanel />,
    },
  };

  return (
    <div className={styles.uiOverlay}>
      <div className={styles.menuBar}>
        {(Object.entries(tabs) as ObjectEntries<typeof tabs>).map(
          ([id, { icon }]) => (
            <button
              type="button"
              className={styles.tabButton}
              aria-selected={activeTab === id}
              onClick={() => {
                setActiveTab(activeTab === id ? null : id);
              }}
            >
              {icon}
            </button>
          )
        )}
      </div>
      {activeTab ? tabs[activeTab].panel : null}
    </div>
  );
}
