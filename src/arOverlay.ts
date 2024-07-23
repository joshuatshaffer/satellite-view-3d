import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import { getSatPosition } from "./getSatPosition";
import { deviceOrientationToCameraQuaternion } from "./rotations";
import { down, east, north } from "./sceneSpaceDirections";

export function initAr(canvas: HTMLCanvasElement, arDom: HTMLDivElement) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    // TODO: Match the physical camera's field of view.
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new WebGLRenderer({ canvas, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  const labelRenderer = new CSS2DRenderer({ element: arDom });
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(
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
    new BufferAttribute(
      new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1]),
      3
    )
  );

  {
    const text = document.createElement("div");
    text.className = "label";
    text.textContent = "north";

    const label = new CSS2DObject(text);
    label.position.copy(north().multiplyScalar(100));
    label.center.set(0.5, 0);

    scene.add(label);
  }

  {
    const text = document.createElement("div");
    text.className = "label";
    text.textContent = "east";

    const label = new CSS2DObject(text);
    label.position.copy(east().multiplyScalar(100));
    label.center.set(0.5, 0);

    scene.add(label);
  }

  {
    const text = document.createElement("div");
    text.className = "label";
    text.textContent = "down";

    const label = new CSS2DObject(text);
    label.position.copy(down().multiplyScalar(100));
    label.center.set(0.5, 0);

    scene.add(label);
  }

  const particles = new Points(
    geometry,
    new PointsMaterial({ size: 2, vertexColors: true })
  );
  scene.add(particles);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
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
      deviceOrientationToCameraQuaternion(orientation, camera.quaternion);
    }

    geometry.attributes.position.setXYZ(3, ...getSatPosition().toArray());
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}
