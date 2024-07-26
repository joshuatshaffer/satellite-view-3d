import { useEffect, useState } from "react";
import { initAr } from "./arOverlay";

export function ArOverlay() {
  const [arCanvas, setArCanvas] = useState<HTMLCanvasElement | null>(null);
  const [arDom, setArDom] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!arCanvas || !arDom) {
      return;
    }

    initAr(arCanvas, arDom);
  }, [arCanvas, arDom]);

  return (
    <>
      <canvas ref={setArCanvas} id="ar-canvas"></canvas>
      <div ref={setArDom} id="ar-dom"></div>
    </>
  );
}
