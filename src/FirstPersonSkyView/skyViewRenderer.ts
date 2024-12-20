import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import Stats from "three/addons/libs/stats.module.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { getTles } from "../satdb/tles";
import { clamp } from "./clamp";
import { makeDeviceOrientationControls } from "./DeviceOrientationControls";
import { makeGrid } from "./grid/grid";
import { makeInputs, PointerPosition } from "./inputs";
import { Store } from "./jotai-types";
import { makeHighlightedSatelliteLabels } from "./makeHighlightedSatelliteLabels";
import { degToRad } from "./rotations";
import { satelliteAtPointer } from "./satelliteAtPointer";
import { SatelliteDefinition, setSatellitesAtom } from "./SatelliteDefinitions";
import { makeSatelliteLabel } from "./SatelliteLabel/makeSatelliteLabel";
import { makeSatelliteOffscreenPointer } from "./SatelliteLabel/makeSatelliteOffscreenPointer";
import { makeSatellitePoints } from "./SatellitePoints";
import { makeSatellitePositions } from "./SatellitePositions";
import { dragScaleAtom, lookScaleAtom, viewControlModeAtom } from "./settings";
import { timeAtom } from "./Time";
import { selectedSatelliteIdAtom } from "./urlAtom";

const maxElevation = degToRad(90);
const minElevation = degToRad(-90);

export function startSkyViewRenderer({
  canvas,
  labelRoot,
  hudRoot,
  store,
}: {
  canvas: HTMLCanvasElement;

  /**
   * For rendering DOM elements in 3D space.
   */
  labelRoot: HTMLDivElement;

  /**
   * For rendering DOM elements in screen space.
   */
  hudRoot: HTMLDivElement;

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

  const labelRenderer = new CSS2DRenderer({ element: labelRoot });
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";

  const grid = makeGrid(camera);

  scene.add(grid.gridRoot);

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

  getTles().then((tles) => {
    store.set(
      setSatellitesAtom,
      tles.map(
        (tle): SatelliteDefinition => ({
          displayName: tle.objectName,
          tle: [tle.line1, tle.line2],
        })
      )
    );
  });

  const satellitePositions = makeSatellitePositions(store);

  const satellitePoints = makeSatellitePoints(satellitePositions);
  scene.add(satellitePoints.points);

  const hoverLabel = makeSatelliteLabel(scene, satellitePositions, store);

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

  const selectedSatelliteLabel = makeSatelliteLabel(
    scene,
    satellitePositions,
    store
  );
  const selectedSatelliteOffscreenPointer = makeSatelliteOffscreenPointer({
    hudRoot,
    satellitePositions,
    store,
    camera,
  });

  const highlightedSatelliteLabels = makeHighlightedSatelliteLabels({
    scene,
    hudRoot,
    satellitePositions,
    store,
    camera,
  });

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

    grid.update();
    selectedSatelliteOffscreenPointer.update(
      store.get(selectedSatelliteIdAtom)
    );
    highlightedSatelliteLabels.update();

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

    selectedSatelliteOffscreenPointer.dispose();
    highlightedSatelliteLabels.dispose();

    renderer.setAnimationLoop(null);
    renderer.dispose();
    stats.dom.remove();
    labelRenderer.domElement.innerHTML = "";
    window.removeEventListener("resize", onWindowResize);
  };
}
