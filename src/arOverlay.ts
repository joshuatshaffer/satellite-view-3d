import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
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
import { ViewControls } from "./ArOverlay/ViewControls";
import { Satellite } from "./Satellite";
import { Store } from "./jotai-types";
import { degToRad } from "./rotations";
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
    div.className = "label";
    div.textContent = text;

    const label = new CSS2DObject(div);
    label.position.copy(position).multiplyScalar(100);
    label.center.set(0.5, 0.5);

    scene.add(label);
  }

  const sats = [
    new Satellite(
      "ISS",
      "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997",
      "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357"
    ),
    new Satellite(
      "NOAA 15",
      "1 25338U 98030A   24205.56694301  .00000578  00000-0  25704-3 0  9999",
      "2 25338  98.5672 231.9320 0009648 212.5949 147.4637 14.26637206362379"
    ),
    new Satellite(
      "NOAA 18",
      "1 28654U 05018A   24205.45690124  .00000515  00000-0  29850-3 0  9991",
      "2 28654  98.8737 282.1203 0013415 323.8830  36.1435 14.13261241988291"
    ),
    new Satellite(
      "NOAA 19",
      "1 33591U 09005A   24205.55510556  .00000493  00000-0  28834-3 0  9994",
      "2 33591  99.0451 261.7357 0013813 185.5094 174.5927 14.13055684796509"
    ),
  ];

  for (const sat of sats) {
    scene.add(sat.object3D);
    if (sat.nextPassLine) scene.add(sat.nextPassLine);
  }

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onWindowResize);

  function animate() {
    viewControls.update();

    for (const sat of sats) {
      sat.update();
    }

    stats.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  return () => {
    console.log("Cleaning up AR overlay");
    viewControls.disable();
    renderer.setAnimationLoop(null);
    renderer.dispose();
    stats.dom.remove();
    labelRenderer.domElement.innerHTML = "";
    window.removeEventListener("resize", onWindowResize);
  };
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
