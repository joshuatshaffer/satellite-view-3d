import { useAtom } from "jotai";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { ControlPanel } from "./ControlPanel/ControlPanel";
import { Search } from "./Search/Search";
import styles from "./UiOverlay.module.css";
import { fullscreenBodyAtom } from "./fullscreenElementAtom";

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
        <FullscreenButton />
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

function FullscreenButton() {
  const [fullscreen, setFullscreen] = useAtom(fullscreenBodyAtom);

  return (
    <button
      type="button"
      className={styles.tabButton}
      onClick={() => {
        setFullscreen(!fullscreen);
      }}
      title={fullscreen ? "Exit fullscreen" : "Fullscreen mode"}
    >
      {fullscreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
    </button>
  );
}
