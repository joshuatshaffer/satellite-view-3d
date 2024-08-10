import { PerspectiveCamera, Scene, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import styles from "./ArOverlay.module.css";
import { lookAnglesToPosition } from "./lookAnglesToPosition";
import { degToRad, radToDeg } from "./rotations";
import { wrap } from "./wrap";

function distanceToViewEdge(camera: PerspectiveCamera, position: Vector3) {
  const deviceCoordinates = position.clone().project(camera);
  return Math.min(
    1 - Math.abs(deviceCoordinates.x),
    1 - Math.abs(deviceCoordinates.y)
  );
}

function deviceCoordinatesToLookAngles(
  camera: PerspectiveCamera,
  deviceCoordinates: Vector3
) {
  const direction = deviceCoordinates.clone().unproject(camera).normalize();

  const azimuth = wrap(
    Math.PI - Math.atan2(direction.x, direction.z),
    0,
    Math.PI * 2
  );
  const elevation = Math.asin(direction.y);

  return { azimuth, elevation };
}

const debugElement = document.getElementById("debug")!;

export function makeGridLabels(scene: Scene, camera: PerspectiveCamera) {
  const makeLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 1);

    scene.add(label);

    return {
      text,
      label,
    };
  };

  const labels = Array.from({ length: 4 }, makeLabel);

  const bar = makeLabel();

  const update = () => {
    camera.updateMatrixWorld();

    const points = {
      topLeft: deviceCoordinatesToLookAngles(camera, new Vector3(-1, 1, 0)),
      topCenter: deviceCoordinatesToLookAngles(camera, new Vector3(0, 1, 0)),
      topRight: deviceCoordinatesToLookAngles(camera, new Vector3(1, 1, 0)),
      centerLeft: deviceCoordinatesToLookAngles(camera, new Vector3(-1, 0, 0)),
      centerRight: deviceCoordinatesToLookAngles(camera, new Vector3(1, 0, 0)),
      bottomLeft: deviceCoordinatesToLookAngles(camera, new Vector3(-1, -1, 0)),
      bottomCenter: deviceCoordinatesToLookAngles(
        camera,
        new Vector3(0, -1, 0)
      ),
      bottomRight: deviceCoordinatesToLookAngles(camera, new Vector3(1, -1, 0)),
    };

    const elevation = degToRad(-60);

    for (let i = 0; i < labels.length; i++) {
      const azimuth = degToRad(i * 90);

      const position = lookAnglesToPosition({ azimuth, elevation });

      const distance = distanceToViewEdge(camera, position);

      labels[i].label.position.copy(position);
      labels[i].text.textContent = `${distance} (${azimuth.toFixed(
        2
      )}, ${elevation.toFixed(2)})`;
    }

    const foo =
      points.bottomLeft.elevation < elevation !==
      points.bottomCenter.elevation < elevation;

    if (foo) {
      const r = findRoot(
        (azimuth) =>
          distanceToViewEdge(
            camera,
            lookAnglesToPosition({ azimuth, elevation })
          ),
        points.bottomLeft.azimuth,
        points.bottomCenter.azimuth
      );

      bar.label.visible = true;
      bar.text.textContent = radToDeg(elevation).toFixed(2);
      bar.label.position.copy(lookAnglesToPosition({ azimuth: r, elevation }));
    } else {
      bar.label.visible = false;
    }

    debugElement.textContent = JSON.stringify(
      {
        ...Object.fromEntries(
          Object.entries(points).map(([k, { azimuth, elevation }]) => [
            k,
            { azimuth: radToDeg(azimuth), elevation: radToDeg(elevation) },
          ])
        ),
        foo,
      },
      null,
      2
    );
  };

  return {
    update,
  };
}

function findRoot(
  f: (x: number) => number,
  x0: number,
  x1: number,
  epsilon = 0.0001,
  maxIterations = 100
) {
  let x;
  for (let i = 0; i < maxIterations; i++) {
    x = x1 - (f(x1) * (x1 - x0)) / (f(x1) - f(x0));
    if (Math.abs(x - x0) < epsilon) {
      break;
    }
    [x0, x1] = [x1, x];
  }
  return x!;
}
