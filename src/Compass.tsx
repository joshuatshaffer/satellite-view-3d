import { useEffect, useState } from "react";
import * as THREE from "three";
import { degToRad, deviceOrientationToEuler } from "./rotations";

const north = () => new THREE.Vector3(0, 0, -1);
const east = () => new THREE.Vector3(1, 0, 0);
const south = () => new THREE.Vector3(0, 0, 1);
const west = () => new THREE.Vector3(-1, 0, 0);
const up = () => new THREE.Vector3(0, 1, 0);
const down = () => new THREE.Vector3(0, -1, 0);

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

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          ...north().multiplyScalar(100).toArray(),
          ...east().multiplyScalar(100).toArray(),
          ...down().multiplyScalar(100).toArray(),
        ]),
        3
      )
    );

    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 2, color: 16777215 })
    );
    scene.add(particles);

    let orientation: DeviceOrientationEvent | null = null;

    window.addEventListener(
      "deviceorientationabsolute",
      (event: DeviceOrientationEvent) => {
        orientation = event;
      }
    );

    function animate() {
      if (orientation) {
        camera.quaternion.setFromEuler(deviceOrientationToEuler(orientation));
        camera.quaternion.premultiply(
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(degToRad(-90), 0, 0, "XYZ")
          )
        );
      }

      renderer.render(scene, camera);
    }
  }, [canvas]);

  return (
    <canvas
      ref={setCanvas}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
