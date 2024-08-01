import * as satellite from "satellite.js";
import {
  BufferAttribute,
  BufferGeometry,
  Euler,
  Points,
  PointsMaterial,
  Scene,
} from "three";
import { CSS2DObject } from "three/examples/jsm/Addons.js";
import styles from "./ArOverlay.module.css";
import tleUrl from "./generated/tle.txt";
import { observerGd } from "./observer";
import { north } from "./sceneSpaceDirections";

type Tle = [line1: string, line2: string];

interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export function makeSatellites(scene: Scene) {
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
    let i = 0;

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

  return {
    update: () => {
      updatePositions();
      updateLabels();
    },

    dispose: () => {
      scene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
    },
  };
}

function lookAnglesToEuler(lookAngles: satellite.LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}
