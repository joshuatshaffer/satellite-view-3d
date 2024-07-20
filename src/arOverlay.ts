import * as THREE from "three";
import { getSatPosition } from "./getSatPosition";
import { degToRad, deviceOrientationToEuler } from "./rotations";
import { down, east, north } from "./sceneSpaceDirections";

export function initAr(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    // TODO: Match the physical camera's field of view.
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
        ...getSatPosition().toArray(),
      ]),
      3
    )
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
      new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1]),
      3
    )
  );

  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 2, vertexColors: true })
  );
  scene.add(particles);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

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

    geometry.attributes.position.setXYZ(3, ...getSatPosition().toArray());

    renderer.render(scene, camera);
  }
}
