import { Scene } from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";
import { Store } from "../jotai-types";
import { satelliteDefinitionsAtom } from "../SatelliteDefinitions";
import { SatellitePositions } from "../SatellitePositions/SatellitePositions";
import styles from "../SkyViewRenderer.module.css";

export function makeSatelliteLabel(
  scene: Scene,
  satellitePositions: SatellitePositions,
  store: Store
) {
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

  const dispose = () => {
    scene.remove(label);
    label.element.remove();
  };

  return { update, dispose };
}
