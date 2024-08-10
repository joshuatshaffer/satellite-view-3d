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
  const labelPool = makeLabelPool(scene);

  const update = () => {
    labelPool.reset();
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

    for (const elevation of [
      degToRad(-60),
      degToRad(-30),
      0,
      degToRad(30),
      degToRad(60),
    ]) {
      if (
        points.bottomLeft.elevation < elevation !==
        points.bottomCenter.elevation < elevation
      ) {
        const r = findRoot(
          (azimuth) =>
            distanceToViewEdge(
              camera,
              lookAnglesToPosition({ azimuth, elevation })
            ),
          points.bottomLeft.azimuth,
          points.bottomCenter.azimuth
        );

        labelPool.place(
          lookAnglesToPosition({ azimuth: r, elevation }),
          radToDeg(elevation).toFixed(2)
        );
        labelPool.place(
          lookAnglesToPosition({
            azimuth: 2 * points.bottomCenter.azimuth - r,
            elevation,
          }),
          radToDeg(elevation).toFixed(2)
        );
      }

      if (
        points.bottomLeft.elevation < elevation !==
        points.centerLeft.elevation < elevation
      ) {
        const r = findRoot(
          (azimuth) =>
            distanceToViewEdge(
              camera,
              lookAnglesToPosition({ azimuth, elevation })
            ),
          points.bottomLeft.azimuth,
          points.centerLeft.azimuth
        );

        labelPool.place(
          lookAnglesToPosition({ azimuth: r, elevation }),
          radToDeg(elevation).toFixed(2)
        );
        labelPool.place(
          lookAnglesToPosition({
            azimuth: 2 * points.bottomCenter.azimuth - r,
            elevation,
          }),
          radToDeg(elevation).toFixed(2)
        );
      }
    }

    debugElement.textContent = JSON.stringify(
      {
        ...Object.fromEntries(
          Object.entries(points).map(([k, { azimuth, elevation }]) => [
            k,
            { azimuth: radToDeg(azimuth), elevation: radToDeg(elevation) },
          ])
        ),
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

function makeLabelPool(scene: Scene) {
  const pool: { label: CSS2DObject; text: HTMLDivElement }[] = [];
  let used = 0;

  const makeLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0.5, 0.5);

    scene.add(label);

    return {
      label,
      text,
    };
  };

  const getLabel = () => {
    if (used < pool.length) {
      const label = pool[used];
      used++;
      return label;
    } else {
      const label = makeLabel();
      pool.push(label);
      used++;
      return label;
    }
  };

  return {
    reset: () => {
      used = 0;
      for (const { label } of pool) {
        label.visible = false;
      }
    },

    place: (position: Vector3, textContent: string) => {
      const { label, text } = getLabel();
      text.textContent = textContent;
      label.position.copy(position);
      label.visible = true;
    },
  };
}
