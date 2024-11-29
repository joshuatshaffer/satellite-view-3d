import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import Stats from "three/addons/libs/stats.module.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import styles from "./ArOverlay.module.css";
import { clamp } from "./clamp";
import { makeDeviceOrientationControls } from "./DeviceOrientationControls";
import { fetchSatelliteDefinitions } from "./fetchSatelliteDefinitions";
import { makeGrid } from "./grid";
import { makeGridLabels } from "./gridLabels";
import { makeInputs, PointerPosition } from "./inputs";
import { Store } from "./jotai-types";
import { degToRad } from "./rotations";
import { satelliteAtPointer } from "./satelliteAtPointer";
import {
  satelliteDefinitionsAtom,
  setSatellitesAtom,
} from "./SatelliteDefinitions";
import { SatellitePoints } from "./SatellitePoints";
import { SatellitePositions } from "./SatellitePositions";
import { down, east, north, south, up, west } from "./sceneSpaceDirections";
import { dragScaleAtom, lookScaleAtom, viewControlModeAtom } from "./settings";
import { timeAtom } from "./Time";
import { selectedSatelliteIdAtom } from "./urlAtom";

const maxElevation = degToRad(90);
const minElevation = degToRad(-90);

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

  scene.add(makeGrid());

  const gridLabels = makeGridLabels(scene, camera);

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

  const onClick = (pointerPosition: PointerPosition) => {
    store.set(
      selectedSatelliteIdAtom,
      satelliteAtPointer({
        satellitePositions,
        pointerPosition,
        camera,
        canvas,
      })
    );

    console.log("Selected satellite", store.get(selectedSatelliteIdAtom));
  };

  const deviceOrientationControls = makeDeviceOrientationControls(camera);

  const updateActiveControls = () => {
    const viewControlMode = store.get(viewControlModeAtom);

    if (viewControlMode === "deviceOrientation") {
      deviceOrientationControls.enable();
    } else {
      deviceOrientationControls.disable();
    }
  };

  updateActiveControls();
  const unsubscribeViewControlModeAtom = store.sub(
    viewControlModeAtom,
    updateActiveControls
  );

  let zoom = 1;
  const onZoom = (delta: number) => {
    // TODO: Zoom towards the pointer position in drag and look modes.
    zoom = clamp(zoom - delta * 0.001, 1, 10);

    camera.zoom = zoom * zoom;
    camera.updateProjectionMatrix();
  };

  const inputs = makeInputs(canvas, {
    onDrag: ({ from, to, pinchingWith }) => {
      const viewControlMode = store.get(viewControlModeAtom);

      if (viewControlMode === "drag") {
        const scale =
          degToRad(camera.getEffectiveFOV()) * store.get(dragScaleAtom);

        camera.rotation.set(
          clamp(
            camera.rotation.x +
              ((to.offsetY - from.offsetY) / window.innerHeight) * scale,
            minElevation,
            maxElevation
          ),
          camera.rotation.y +
            ((to.offsetX - from.offsetX) / window.innerWidth) * scale,
          0,
          "YXZ"
        );
      } else if (viewControlMode === "look") {
        const scale =
          degToRad(camera.getEffectiveFOV()) * store.get(lookScaleAtom);

        camera.rotation.set(
          clamp(
            camera.rotation.x -
              ((to.offsetY - from.offsetY) / window.innerHeight) * scale,
            minElevation,
            maxElevation
          ),
          camera.rotation.y -
            ((to.offsetX - from.offsetX) / window.innerWidth) * scale,
          0,
          "YXZ"
        );
      }

      if (pinchingWith) {
        const fromDx = from.offsetX - pinchingWith.offsetX;
        const fromDy = from.offsetY - pinchingWith.offsetY;
        const toDx = to.offsetX - pinchingWith.offsetX;
        const toDy = to.offsetY - pinchingWith.offsetY;
        const fromDistance = Math.sqrt(fromDx * fromDx + fromDy * fromDy);
        const toDistance = Math.sqrt(toDx * toDx + toDy * toDy);

        onZoom((fromDistance - toDistance) * 5);
      }
    },
    onClick,
    onZoom,
  });

  fetchSatelliteDefinitions().then((definitions) => {
    store.set(setSatellitesAtom, definitions);
  });

  const satellitePositions = new SatellitePositions(store);

  const satellitePoints = new SatellitePoints(satellitePositions);
  scene.add(satellitePoints.points);

  const makeSatelliteLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    scene.add(label);

    const update = (satelliteId: string | undefined) => {
      if (satelliteId === undefined) {
        label.visible = false;
        return;
      }

      const index = satellitePositions.idToIndex.get(satelliteId);
      const definition = store
        .get(satelliteDefinitionsAtom)
        .definitions.get(satelliteId);

      if (index === undefined || definition === undefined) {
        label.visible = false;
        return;
      }

      label.visible = true;
      label.element.textContent = definition.displayName;
      label.position.set(
        satellitePositions.scenePositions[index * 3],
        satellitePositions.scenePositions[index * 3 + 1],
        satellitePositions.scenePositions[index * 3 + 2]
      );
    };

    return { update };
  };

  const hoverLabel = makeSatelliteLabel();

  const updateHover = () => {
    const inputState = inputs.getInputState();
    const pointerPosition =
      inputState.mightClick ?? inputState.hoveringPointers[0];

    const hoveredSatelliteId = pointerPosition
      ? satelliteAtPointer({
          pointerPosition,
          satellitePositions,
          camera,
          canvas,
        })
      : undefined;

    hoverLabel.update(hoveredSatelliteId);

    if (hoveredSatelliteId) {
      canvas.style.cursor = "pointer";
    } else {
      const viewControlMode = store.get(viewControlModeAtom);

      if (viewControlMode === "drag") {
        if (inputState.downPointers.length > 0) {
          canvas.style.cursor = "grabbing";
        } else {
          canvas.style.cursor = "grab";
        }
      } else if (viewControlMode === "look") {
        if (inputState.downPointers.length > 0) {
          canvas.style.cursor = "none";
        } else {
          canvas.style.cursor = "move";
        }
      } else {
        canvas.style.cursor = "default";
      }
    }
  };

  const selectedSatelliteLabel = makeSatelliteLabel();

  const onWindowResize = () => {
    // TODO: Update FOV when screen rotates. FOV is for the width of the screen.
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("resize", onWindowResize);

  function animate() {
    store.set(timeAtom, new Date());
    satellitePositions.update();
    satellitePoints.update();
    updateHover();
    selectedSatelliteLabel.update(store.get(selectedSatelliteIdAtom));
    deviceOrientationControls.update();

    gridLabels.update();

    stats.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  return () => {
    console.log("Cleaning up AR overlay");

    inputs.dispose();
    unsubscribeViewControlModeAtom();
    deviceOrientationControls.disable();

    scene.remove(satellitePoints.points);
    satellitePoints.dispose();
    satellitePositions.dispose();

    renderer.setAnimationLoop(null);
    renderer.dispose();
    stats.dom.remove();
    labelRenderer.domElement.innerHTML = "";
    window.removeEventListener("resize", onWindowResize);
  };
}
