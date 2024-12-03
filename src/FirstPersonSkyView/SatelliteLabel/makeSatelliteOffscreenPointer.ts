import { PerspectiveCamera, Vector3 } from "three";
import { Store } from "../jotai-types";
import { ndcInView } from "../ndcInView";
import { satelliteDefinitionsAtom } from "../SatelliteDefinitions";
import { SatellitePositions } from "../SatellitePositions";
import styles from "./satelliteOffscreenPointer.module.scss";

export function makeSatelliteOffscreenPointer({
  hudRoot,
  satellitePositions,
  store,
  camera,
}: {
  hudRoot: HTMLDivElement;
  satellitePositions: SatellitePositions;
  store: Store;
  camera: PerspectiveCamera;
}) {
  const rootElement = document.createElement("div");
  rootElement.className = styles.offscreenPointer;

  const label = document.createElement("div");
  label.style.position = "absolute";
  label.style.width = "max-content";
  label.className = styles.label;

  rootElement.appendChild(label);

  hudRoot.appendChild(rootElement);

  const satellitePositionNdc = new Vector3();

  const update = (satelliteId: string | undefined) => {
    if (satelliteId === undefined) {
      rootElement.hidden = true;
      return;
    }

    const index = satellitePositions.idToIndex.get(satelliteId);
    const definition = store
      .get(satelliteDefinitionsAtom)
      .definitions.get(satelliteId);

    if (index === undefined || definition === undefined) {
      rootElement.hidden = true;
      return;
    }

    satellitePositionNdc
      .set(
        satellitePositions.scenePositions[index * 3],
        satellitePositions.scenePositions[index * 3 + 1],
        satellitePositions.scenePositions[index * 3 + 2]
      )
      .project(camera);

    if (ndcInView(satellitePositionNdc)) {
      rootElement.hidden = true;
      return;
    }

    const satelliteBehindCamera = satellitePositionNdc.z >= 1;

    // If the satellite is behind the camera the projected coordinates will be
    // flipped.
    if (satelliteBehindCamera) {
      satellitePositionNdc.x = -satellitePositionNdc.x;
      satellitePositionNdc.y = -satellitePositionNdc.y;
    }

    const angle = Math.atan2(satellitePositionNdc.y, satellitePositionNdc.x);

    const s = Math.sin(angle);
    const c = Math.cos(angle);

    if (Math.abs(s) > Math.abs(c)) {
      satellitePositionNdc.set(c / Math.abs(s), Math.sign(s), 0);
    } else {
      satellitePositionNdc.set(Math.sign(c), s / Math.abs(c), 0);
    }

    const pointingLeft = angle > Math.PI / 2 || angle < -Math.PI / 2;

    label.textContent = definition.displayName;

    rootElement.dataset.pointing = pointingLeft ? "left" : "right";
    rootElement.dataset.behindCamera = satelliteBehindCamera ? "true" : "false";

    rootElement.style.left = `${(1 + satellitePositionNdc.x) * 50}%`;
    rootElement.style.top = `${(1 - satellitePositionNdc.y) * 50}%`;
    rootElement.style.transform = `rotate(${
      pointingLeft ? Math.PI - angle : -angle
    }rad)`;

    rootElement.hidden = false;
  };

  const dispose = () => {
    hudRoot.removeChild(rootElement);
  };

  return { update, dispose };
}
