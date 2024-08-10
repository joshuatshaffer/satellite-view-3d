import { PerspectiveCamera, Scene, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import styles from "./ArOverlay.module.css";
import { lookAnglesToPosition } from "./lookAnglesToPosition";
import { degToRad } from "./rotations";

function distanceToViewEdge(camera: PerspectiveCamera, position: Vector3) {
  const deviceCoordinates = position.clone().project(camera);
  return Math.min(
    1 - Math.abs(deviceCoordinates.x),
    1 - Math.abs(deviceCoordinates.y)
  );
}

export function makeGridLabels(scene: Scene, camera: PerspectiveCamera) {
  const labels = Array.from({ length: 4 }, () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    scene.add(label);

    return {
      text,
      label,
    };
  });

  const update = () => {
    const elevation = degToRad(-30);

    for (let i = 0; i < labels.length; i++) {
      const azimuth = degToRad(i * 90);

      const position = lookAnglesToPosition({ azimuth, elevation });

      const distance = distanceToViewEdge(camera, position);

      labels[i].label.position.copy(position);
      labels[i].text.textContent = `${distance} (${azimuth.toFixed(
        2
      )}, ${elevation.toFixed(2)})`;
    }
  };

  return {
    update,
  };
}
