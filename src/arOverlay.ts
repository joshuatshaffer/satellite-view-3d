import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import { getSatPosition } from "./getSatPosition";
import { degToRad, deviceOrientationToCameraQuaternion } from "./rotations";
import { down, east, north, south, up, west } from "./sceneSpaceDirections";

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

  scene.add(horizontalLine());
  scene.add(horizontalLine(degToRad(30)));
  scene.add(horizontalLine(degToRad(-30)));
  scene.add(horizontalLine(degToRad(60)));
  scene.add(horizontalLine(degToRad(-60)));

  for (const { text, position } of [
    { text: "North", position: north() },
    { text: "South", position: south() },
    { text: "East", position: east() },
    { text: "West", position: west() },
    { text: "Nadir", position: down() },
    { text: "Zenith", position: up() },
  ]) {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = text;

    const label = new CSS2DObject(div);
    label.position.copy(position).multiplyScalar(100);
    label.center.set(0.5, 0.5);

    scene.add(label);
  }

  {
    const text = document.createElement("div");
    text.className = "label";
    text.textContent = "ISS";

    const label = new CSS2DObject(text);
    label.position.copy(getSatPosition());
    label.center.set(0, 0);

    scene.add(label);
  }

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

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}

function horizontalLine(elevation = 0) {
  const numberOfSegments = 100;
  const radius = 100;

  return new Line(
    new BufferGeometry().setFromPoints(
      Array.from({ length: numberOfSegments + 1 }, (_, i) => {
        const theta = (Math.PI * 2 * i) / numberOfSegments;

        return new Vector3(
          Math.cos(elevation) * Math.cos(theta) * radius,
          Math.sin(elevation) * radius,
          Math.cos(elevation) * Math.sin(theta) * radius
        );
      })
    ),
    new LineBasicMaterial({ color: 0x0000ff })
  );
}
