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

export function makeSatellites(
  scene: Scene,
  store: Store,
  camera: Camera,
  canvas: HTMLCanvasElement
) {
  let definitions = new Map<string, SatelliteDefinition>();
  let records = new Map<string, satellite.SatRec>();

  let scenePositions = new Float32Array(3 * records.size);
  let indexToId = new Map<number, string>();
  let idToIndex = new Map<string, number>();

  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(scenePositions, 3));
  geometry.setDrawRange(0, indexToId.size);

  let particles = new Points(
    geometry,
    new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
  );
  scene.add(particles);

  const updatePositions = (nowDate = new Date()) => {
    const nowGmst = satellite.gstime(nowDate);

    const observerGd = store.get(observerGdAtom);

    indexToId = new Map();
    idToIndex = new Map();
    for (const [id, record] of records) {
      const positionAndVelocity = satellite.propagate(record, nowDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        continue;
      }

      const positionEcf = satellite.eciToEcf(positionEci, nowGmst);

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      const index = indexToId.size;

      scenePositions.set(
        north()
          .applyEuler(lookAnglesToEuler(lookAngles))
          .multiplyScalar(100)
          .toArray(),
        index * 3
      );

      indexToId.set(index, id);
      idToIndex.set(id, index);
    }

    geometry.setDrawRange(0, indexToId.size);
    geometry.attributes.position.needsUpdate = true;
  };

  const makeLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    scene.add(label);

    return label;
  };

  const hoverLabel = makeLabel();

  const updateHoveredLabel = () => {
    if (hoveredSatelliteId === undefined) {
      hoverLabel.visible = false;
      return;
    }

    const index = idToIndex.get(hoveredSatelliteId);
    const definition = definitions.get(hoveredSatelliteId);

    if (index === undefined || definition === undefined) {
      hoverLabel.visible = false;
      return;
    }

    hoverLabel.visible = true;
    hoverLabel.element.textContent = definition.displayName;
    hoverLabel.position.set(
      scenePositions[index * 3],
      scenePositions[index * 3 + 1],
      scenePositions[index * 3 + 2]
    );
  };

  const labels = Array.from({ length: 5 }, () => makeLabel());

  const updateLabels = () => {
    let i = 0;

    for (; i < labels.length && i < indexToId.size; i++) {
      const id = indexToId.get(i);
      const definition = id ? definitions.get(id) : undefined;

      labels[i].visible = true;
      labels[i].element.textContent = definition?.displayName ?? "";
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

  const setSatellites = (newDefinitions: Iterable<SatelliteDefinition>) => {
    definitions = new Map();
    records = new Map();

    for (const definition of newDefinitions) {
      const record = satellite.twoline2satrec(
        definition.tle[0],
        definition.tle[1]
      );

      const id = record.satnum;

      definitions.set(id, definition);
      records.set(id, record);
    }

    scenePositions = new Float32Array(3 * records.size);
    indexToId = new Map();
    idToIndex = new Map();

    scene.remove(particles);
    particles.geometry.dispose();
    particles.material.dispose();

    geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(scenePositions, 3));
    geometry.setDrawRange(0, indexToId.size);

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

  let hoveredSatelliteId: string | undefined;

  const onPointerMove = (event: PointerEvent): void => {
    const maxDistance = 10;
    const maxDistanceSq = maxDistance * maxDistance;

    let closestIndex: number | undefined;
    let closestDistanceSq = Infinity;

    // Pre-compute the matrix for efficiency instead of using
    // `satellitePosition.project(camera)`.
    const sceneSpaceToNdc = new Matrix4()
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse);

    const positionInNdc = new Vector3();

    for (let i = 0; i < indexToId.size; i++) {
      positionInNdc
        .set(
          scenePositions[i * 3],
          scenePositions[i * 3 + 1],
          scenePositions[i * 3 + 2]
        )
        .applyMatrix4(sceneSpaceToNdc);

      const isInView =
        positionInNdc.z >= 0 &&
        positionInNdc.z <= 1 &&
        positionInNdc.x >= -1 &&
        positionInNdc.x <= 1 &&
        positionInNdc.y >= -1 &&
        positionInNdc.y <= 1;

      if (!isInView) {
        continue;
      }

      const dx =
        (1 + positionInNdc.x) * (canvas.offsetWidth / 2) - event.offsetX;
      const dy =
        (1 - positionInNdc.y) * (canvas.offsetHeight / 2) - event.offsetY;

      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < maxDistanceSq && distanceSq < closestDistanceSq) {
        closestDistanceSq = distanceSq;
        closestIndex = i;
      }
    }

    hoveredSatelliteId = closestIndex ? indexToId.get(closestIndex) : undefined;
  };

  canvas.addEventListener("pointermove", onPointerMove);

  return {
    update: () => {
      updatePositions();
      updateHoveredLabel();
      updateLabels();
    },

    dispose: () => {
      scene.remove(particles);
      particles.geometry.dispose();
      particles.material.dispose();
      canvas.removeEventListener("pointermove", onPointerMove);
    },
  };
}

function lookAnglesToEuler(lookAngles: satellite.LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}
