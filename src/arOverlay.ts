import {
  BufferGeometry,
  LineBasicMaterial,
  LineLoop,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import Stats from "three/addons/libs/stats.module.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import styles from "./ArOverlay.module.css";
import { ViewControls } from "./ArOverlay/ViewControls";
import { Store } from "./jotai-types";
import { degToRad } from "./rotations";
import { makeSatellites } from "./satellites";
import { down, east, north, south, up, west } from "./sceneSpaceDirections";

export function initAr({
  canvas,
  arDom,
  store,
}: {
  canvas: HTMLCanvasElement;
  arDom: HTMLDivElement;
  store: Store;
}) {
  console.log("Initializing AR overlay");

  const stats = new Stats();
  document.body.appendChild(stats.dom);

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

  const viewControls = ViewControls({ camera, domElement: canvas, store });
  viewControls.enable();

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
    div.className = styles.label;
    div.textContent = text;

    const label = new CSS2DObject(div);
    label.position.copy(position).multiplyScalar(100);
    label.center.set(0.5, 0.5);

    scene.add(label);
  }

  const satellites = makeSatellites(scene);

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onWindowResize);

  function animate() {
    viewControls.update();

    satellites.update();
    stats.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  return () => {
    console.log("Cleaning up AR overlay");
    viewControls.disable();
    satellites.dispose();
    renderer.setAnimationLoop(null);
    renderer.dispose();
    stats.dom.remove();
    labelRenderer.domElement.innerHTML = "";
    window.removeEventListener("resize", onWindowResize);
  };
}

function horizontalLine(elevation = 0) {
  const numberOfVertices = 100;
  const radius = 100;

  return new LineLoop(
    new BufferGeometry().setFromPoints(
      Array.from({ length: numberOfVertices }, (_, i) => {
        const theta = (Math.PI * 2 * i) / numberOfVertices;

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
