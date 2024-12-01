import { useStore } from "jotai";
import { useEffect, useState } from "react";
import styles from "./SkyViewRenderer.module.css";
import { startSkyViewRenderer } from "./skyViewRenderer";

export function SkyViewRenderer() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [labelRoot, setLabelRoot] = useState<HTMLDivElement | null>(null);
  const [hudRoot, setHudRoot] = useState<HTMLDivElement | null>(null);

  const store = useStore();

  useEffect(() => {
    if (!canvas || !labelRoot || !hudRoot) {
      return;
    }

    return startSkyViewRenderer({ canvas, labelRoot, hudRoot, store });
  }, [canvas, labelRoot, hudRoot, store]);

  return (
    <>
      <canvas ref={setCanvas} className={styles.canvas} />
      <div ref={setLabelRoot} className={styles.labelRoot} />
      <div ref={setHudRoot} className={styles.labelRoot} />
    </>
  );
}
