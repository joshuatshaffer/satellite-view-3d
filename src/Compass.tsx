import { useEffect, useState } from "react";
import * as THREE from "three";
import { degToRad } from "./rotations";

export function Compass() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      "/sky/pos-x.jpg",
      "/sky/neg-x.jpg",
      "/sky/pos-y.jpg",
      "/sky/neg-y.jpg",
      "/sky/pos-z.jpg",
      "/sky/neg-z.jpg",
    ]);
    scene.background = texture;

    let orientation: DeviceOrientationEvent | null = null;

    window.addEventListener(
      "deviceorientationabsolute",
      (event: DeviceOrientationEvent) => {
        orientation = event;
      }
    );

    function animate() {
      if (orientation) {
        camera.quaternion.setFromEuler(
          new THREE.Euler(
            degToRad(orientation.beta ?? 0),
            degToRad(orientation.gamma ?? 0),
            degToRad(orientation.alpha ?? 0),
            "ZXY"
          )
        );
        camera.quaternion.premultiply(
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(degToRad(90), degToRad(180), 0, "XYZ")
          )
        );
      }

      renderer.render(scene, camera);
    }
  }, [canvas]);

  return <canvas ref={setCanvas} />;
}
