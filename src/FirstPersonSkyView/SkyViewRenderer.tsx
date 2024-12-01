import { useStore } from "jotai";
import { useEffect, useState } from "react";
import styles from "./SkyViewRenderer.module.css";
import { initAr } from "./skyViewRenderer";

export function ArOverlay() {
  const [arCanvas, setArCanvas] = useState<HTMLCanvasElement | null>(null);
  const [arDom, setArDom] = useState<HTMLDivElement | null>(null);
  const [hudDom, setHudDom] = useState<HTMLDivElement | null>(null);

  const store = useStore();

  useEffect(() => {
    if (!arCanvas || !arDom || !hudDom) {
      return;
    }

    return initAr({ canvas: arCanvas, arDom, hudDom, store });
  }, [arCanvas, arDom, hudDom, store]);

  return (
    <>
      <canvas ref={setArCanvas} className={styles.arCanvas} />
      <div ref={setArDom} className={styles.arDom} />
      <div ref={setHudDom} className={styles.arDom} />
    </>
  );
}
