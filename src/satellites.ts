import * as satellite from "satellite.js";
import {
  BufferAttribute,
  BufferGeometry,
  Camera,
  Euler,
  Matrix4,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
} from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";
import styles from "./ArOverlay.module.css";
import tleUrl from "./generated/tle.txt";
import { Store } from "./jotai-types";
import { north } from "./sceneSpaceDirections";
import { observerGdAtom } from "./settings";

type Tle = [line1: string, line2: string];

interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export function makeSatellites(scene: Scene, store: Store, camera: Camera) {
  let definitions: SatelliteDefinition[] = [];

  let records = definitions.map((d) =>
    satellite.twoline2satrec(d.tle[0], d.tle[1])
  );

  let indexMap: number[] = [];

  let scenePositions = new Float32Array(3 * records.length);

  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(scenePositions, 3));
  geometry.setDrawRange(0, indexMap.length);

  let particles = new Points(
    geometry,
    new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
  );
  scene.add(particles);

  const updatePositions = (nowDate = new Date()) => {
    const nowGmst = satellite.gstime(nowDate);

    const observerGd = store.get(observerGdAtom);

    indexMap = [];
    for (let i = 0; i < records.length; i++) {
      const positionAndVelocity = satellite.propagate(records[i], nowDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        continue;
      }

      const positionEcf = satellite.eciToEcf(positionEci, nowGmst);

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      scenePositions.set(
        north()
          .applyEuler(lookAnglesToEuler(lookAngles))
          .multiplyScalar(100)
          .toArray(),
        indexMap.length * 3
      );

      indexMap.push(i);
    }

    geometry.setDrawRange(0, indexMap.length);
    geometry.attributes.position.needsUpdate = true;
  };

  const labels = Array.from({ length: 5 }, () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    scene.add(label);

    return label;
  });

  const updateLabels = () => {
    let i = 1;

    if (hoveredSatellite !== undefined) {
      labels[0].visible = true;
      labels[0].element.textContent =
        definitions[indexMap[hoveredSatellite]].displayName;
      labels[0].position.set(
        scenePositions[hoveredSatellite * 3],
        scenePositions[hoveredSatellite * 3 + 1],
        scenePositions[hoveredSatellite * 3 + 2]
      );
    }

    for (; i < labels.length && i < indexMap.length; i++) {
      labels[i].visible = true;
      labels[i].element.textContent = definitions[indexMap[i]].displayName;
      labels[i].position.set(
        scenePositions[i * 3],
        scenePositions[i * 3 + 1],
        scenePositions[i * 3 + 2]
      );
    }

    for (; i < labels.length; i++) {
      labels[i].visible = false;
    }
  };

  const setSatellites = (newDefinitions: SatelliteDefinition[]) => {
    definitions = newDefinitions;
    records = definitions.map((d) =>
      satellite.twoline2satrec(d.tle[0], d.tle[1])
    );

    scenePositions = new Float32Array(3 * records.length);

    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();

    geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(scenePositions, 3));
    geometry.setDrawRange(0, indexMap.length);

    particles = new Points(
      geometry,
      new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
    );
    scene.add(particles);
  };

  const fetchSatelliteDefinitions = async () => {
    const response = await fetch(tleUrl);
    const tle = await response.text();
    const lines = tle.split("\n");
    const definitions: SatelliteDefinition[] = [];

    for (let i = 0; i < lines.length - 2; i += 3) {
      definitions.push({
        displayName: lines[i],
        tle: [lines[i + 1], lines[i + 2]],
      });
    }

    setSatellites(definitions);
  };

  fetchSatelliteDefinitions();

  let hoveredSatellite: number | undefined;

  const onPointerMove = (event: PointerEvent): void => {
    const x = (2 * event.clientX) / window.innerWidth - 1;
    const y = 1 - (2 * event.clientY) / window.innerHeight;

    let closestIndex: number | undefined;
    let closestDistance = Infinity;

    // Pre-compute the matrix for efficiency instead of using
    // `satellitePosition.project(camera).sub(mousePosition)`.
    const sceneSpaceToDisplacementFromPointer = new Matrix4()
      .makeTranslation(-x, -y, 0)
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse);

    const displacement = new Vector3();

    for (let i = 0; i < indexMap.length; i++) {
      displacement
        .set(
          scenePositions[i * 3],
          scenePositions[i * 3 + 1],
          scenePositions[i * 3 + 2]
        )
        .applyMatrix4(sceneSpaceToDisplacementFromPointer);

      const distance =
        displacement.x * displacement.x + displacement.y * displacement.y;

      if (distance < 0.1 && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    console.log(
      closestIndex !== undefined
        ? definitions[indexMap[closestIndex]].displayName
        : closestIndex
    );

    hoveredSatellite = closestIndex;
  };

  window.addEventListener("pointermove", onPointerMove);

  return {
    update: () => {
      updatePositions();
      updateLabels();
    },

    dispose: () => {
      scene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
      window.removeEventListener("pointermove", onPointerMove);
    },
  };
}

function lookAnglesToEuler(lookAngles: satellite.LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}
