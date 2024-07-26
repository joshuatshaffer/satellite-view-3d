import { useStore } from "jotai";
import { useEffect, useState } from "react";
import { initAr } from "./arOverlay";

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
      <canvas ref={setArCanvas} id="ar-canvas"></canvas>
      <div ref={setArDom} id="ar-dom"></div>
    </>
  );
}
