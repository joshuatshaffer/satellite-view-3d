import { Object3D, PerspectiveCamera, Vector2, Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { lookAnglesToPosition } from "../lookAnglesToPosition";
import { degToRad, radToDeg } from "../rotations";
import { radii } from "../scenePositions";
import styles from "../SkyViewRenderer.module.css";
import { wrap } from "../wrap";

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

export function makeGridLabels(gridRoot: Object3D, camera: PerspectiveCamera) {
  const labelPool = makeLabelPool(gridRoot);

  const update = () => {
    labelPool.reset();
    camera.updateMatrixWorld();

    const elevationStep = degToRad(30);
    const azimuthStep = degToRad(90);

    const scan = (xToDc: (x: number) => Vector3, center: Vector2) => {
      let prevX = -1;
      let prevTestPoint = deviceCoordinatesToLookAngles(camera, xToDc(prevX));
      for (let i = 1; i < 100; i++) {
        const x = (i * 2) / 100 - 1;
        const testPoint = deviceCoordinatesToLookAngles(camera, xToDc(x));

        if (
          Math.floor(testPoint.elevation / elevationStep) !==
          Math.floor(prevTestPoint.elevation / elevationStep)
        ) {
          const elevation =
            Math.floor(
              Math.max(testPoint.elevation, prevTestPoint.elevation) /
                elevationStep
            ) * elevationStep;
          const r = findRoot(
            (y) =>
              deviceCoordinatesToLookAngles(camera, xToDc(y)).elevation -
              elevation,
            prevX,
            x
          );

          labelPool.place(
            lookAnglesToPosition(
              deviceCoordinatesToLookAngles(camera, xToDc(r)),
              radii.gridLabel
            ),
            radToDeg(elevation).toFixed(0) + "°",
            center
          );
        }

        if (
          Math.floor(testPoint.azimuth / azimuthStep) !==
          Math.floor(prevTestPoint.azimuth / azimuthStep)
        ) {
          const azimuth =
            Math.floor(
              Math.max(testPoint.azimuth, prevTestPoint.azimuth) / azimuthStep
            ) * azimuthStep;
          const r = findRoot(
            (y) =>
              deviceCoordinatesToLookAngles(camera, xToDc(y)).azimuth - azimuth,
            prevX,
            x
          );

          labelPool.place(
            lookAnglesToPosition(
              deviceCoordinatesToLookAngles(camera, xToDc(r)),
              radii.gridLabel
            ),
            radToDeg(azimuth).toFixed(0) + "°",
            center
          );
        }

        prevX = x;
        prevTestPoint = testPoint;
      }
    };

    scan((x) => new Vector3(-1, x, 0.5), new Vector2(0, 0.5));
    scan((x) => new Vector3(1, x, 0.5), new Vector2(1, 0.5));
    scan((x) => new Vector3(x, -1, 0.5), new Vector2(0.5, 1));
    scan((x) => new Vector3(x, 1, 0.5), new Vector2(0.5, 0));
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
  let y0 = f(x0);
  let x = (x0 + x1) / 2;

  for (let i = 0; i < maxIterations; i++) {
    const y = f(x);

    if (Math.abs(y) < epsilon) {
      return x;
    }

    if (Math.sign(y) === Math.sign(y0)) {
      x0 = x;
      y0 = y;
    } else {
      x1 = x;
    }

    x = (x0 + x1) / 2;
  }

  return x;
}

function makeLabelPool(gridRoot: Object3D) {
  const pool: { label: CSS2DObject; text: HTMLDivElement }[] = [];
  let used = 0;

  const makeLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;
    text.style.fontSize = "small";

    const label = new CSS2DObject(text);
    label.center.set(0.5, 0.5);

    gridRoot.add(label);

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

    place: (position: Vector3, textContent: string, center?: Vector2) => {
      const { label, text } = getLabel();
      text.textContent = textContent;
      label.position.copy(position);
      label.visible = true;

      if (center) {
        label.center.copy(center);
      }
    },
  };
}
