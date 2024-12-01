import { Object3D } from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";
import { radii } from "../scenePositions";
import { down, east, north, south, up, west } from "../sceneSpaceDirections";
import styles from "../SkyViewRenderer.module.css";

export function makeCardinalDirectionLabels(gridRoot: Object3D) {
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
    label.position.copy(position).multiplyScalar(radii.cardinalDirectionLabel);
    label.center.set(0.5, 0.5);

    gridRoot.add(label);
  }
}
