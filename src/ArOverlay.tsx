import { useStore } from "jotai";
import { useEffect, useState } from "react";
import { initAr } from "./arOverlay";
import styles from "./ArOverlay.module.css";

export function ArOverlay() {
  const [arCanvas, setArCanvas] = useState<HTMLCanvasElement | null>(null);
  const [arDom, setArDom] = useState<HTMLDivElement | null>(null);

  const store = useStore();

  useEffect(() => {
    if (!arCanvas || !arDom) {
      return;
    }

    return initAr({ canvas: arCanvas, arDom, store });
  }, [arCanvas, arDom, store]);

  return (
    <>
      <canvas ref={setArCanvas} className={styles.arCanvas} />
      <div ref={setArDom} className={styles.arDom} />
    </>
  );
}
