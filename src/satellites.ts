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

class SatelliteDefinitions {
  public readonly definitions = new Map<string, SatelliteDefinition>();
  public readonly records = new Map<string, satellite.SatRec>();

  public readonly dependents = new Set<{
    needsUpdate: boolean;
  }>();

  setSatellites(newDefinitions: Iterable<SatelliteDefinition>) {
    this.definitions.clear();
    this.records.clear();

    for (const definition of newDefinitions) {
      const record = satellite.twoline2satrec(
        definition.tle[0],
        definition.tle[1]
      );

      const id = record.satnum;

      this.definitions.set(id, definition);
      this.records.set(id, record);
    }

    for (const dependent of this.dependents) {
      dependent.needsUpdate = true;
    }
  }
}

class Time {
  public readonly dependents = new Set<{ needsUpdate: boolean }>();

  public date = new Date();

  update() {
    this.date = new Date();

    for (const dependent of this.dependents) {
      dependent.needsUpdate = true;
    }
  }
}

class SatellitePositions {
  public needsUpdate = false;
  public readonly dependents = new Set<{ needsUpdate: boolean }>();

  public scenePositions = new Float32Array(
    3 * this.satelliteDefinitions.records.size
  );
  public readonly indexToId = new Map<number, string>();
  public readonly idToIndex = new Map<string, number>();

  constructor(
    private readonly time: Time,
    private readonly satelliteDefinitions: SatelliteDefinitions,
    private readonly store: Store
  ) {
    this.time.dependents.add(this);
    this.satelliteDefinitions.dependents.add(this);
  }

  private readonly unsubscribeObserverGdAtom = this.store.sub(
    observerGdAtom,
    () => {
      this.needsUpdate = true;
    }
  );

  dispose() {
    this.unsubscribeObserverGdAtom();
    this.satelliteDefinitions.dependents.delete(this);
    this.time.dependents.delete(this);
  }

  update() {
    if (!this.needsUpdate) {
      return;
    }
    this.needsUpdate = false;

    if (
      this.satelliteDefinitions.records.size * 3 >
      this.scenePositions.length
    ) {
      this.scenePositions = new Float32Array(
        3 * this.satelliteDefinitions.records.size
      );
    }

    const nowDate = this.time.date;
    const nowGmst = satellite.gstime(nowDate);

    const observerGd = this.store.get(observerGdAtom);

    this.indexToId.clear();
    this.idToIndex.clear();
    for (const [id, record] of this.satelliteDefinitions.records) {
      const positionAndVelocity = satellite.propagate(record, nowDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        continue;
      }

      const positionEcf = satellite.eciToEcf(positionEci, nowGmst);

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      const index = this.indexToId.size;

      this.scenePositions.set(
        north()
          .applyEuler(lookAnglesToEuler(lookAngles))
          .multiplyScalar(100)
          .toArray(),
        index * 3
      );

      this.indexToId.set(index, id);
      this.idToIndex.set(id, index);
    }

    for (const dependent of this.dependents) {
      dependent.needsUpdate = true;
    }
  }
}

class SatellitePoints {
  public needsUpdate = false;

  public readonly points = new Points(
    new BufferGeometry(),
    new PointsMaterial({ size: 2, color: 0xff0000, sizeAttenuation: false })
  );

  constructor(private readonly satellitePositions: SatellitePositions) {
    this.points.geometry.setAttribute(
      "position",
      new BufferAttribute(this.satellitePositions.scenePositions, 3)
    );
    this.points.geometry.setDrawRange(
      0,
      this.satellitePositions.indexToId.size
    );

    this.satellitePositions.dependents.add(this);
  }

  dispose() {
    this.satellitePositions.dependents.delete(this);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }

  update() {
    if (!this.needsUpdate) {
      return;
    }
    this.needsUpdate = false;

    if (
      this.points.geometry.attributes.position.array !==
      this.satellitePositions.scenePositions
    ) {
      console.log("Recreating geometry");
      this.points.geometry.dispose();
      this.points.geometry = new BufferGeometry();
      this.points.geometry.setAttribute(
        "position",
        new BufferAttribute(this.satellitePositions.scenePositions, 3)
      );
    }

    this.points.geometry.setDrawRange(
      0,
      this.satellitePositions.indexToId.size
    );
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}

export function makeSatellites(
  scene: Scene,
  store: Store,
  camera: Camera,
  canvas: HTMLCanvasElement
) {
  const time = new Time();

  const satelliteDefinitions = new SatelliteDefinitions();

  const satellitePositions = new SatellitePositions(
    time,
    satelliteDefinitions,
    store
  );

  const satellitePoints = new SatellitePoints(satellitePositions);
  scene.add(satellitePoints.points);

  const makeLabel = () => {
    const text = document.createElement("div");
    text.className = styles.label;

    const label = new CSS2DObject(text);
    label.center.set(0, 0);

    scene.add(label);

    return label;
  };

  const labels = Array.from({ length: 5 }, () => makeLabel());

  const updateLabels = () => {
    let i = 0;

    for (; i < labels.length && i < satellitePositions.indexToId.size; i++) {
      const id = satellitePositions.indexToId.get(i);
      const definition = id
        ? satelliteDefinitions.definitions.get(id)
        : undefined;

      labels[i].visible = true;
      labels[i].element.textContent = definition?.displayName ?? "";
      labels[i].position.set(
        satellitePositions.scenePositions[i * 3],
        satellitePositions.scenePositions[i * 3 + 1],
        satellitePositions.scenePositions[i * 3 + 2]
      );
    }

    for (; i < labels.length; i++) {
      labels[i].visible = false;
    }
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

    satelliteDefinitions.setSatellites(definitions);
  };

  fetchSatelliteDefinitions();

  let hoveredSatelliteId: string | undefined;
  let hoveredNeedsUpdate = false;

  const hoverLabel = makeLabel();

  const updateHoveredLabel = () => {
    if (hoveredSatelliteId === undefined) {
      hoverLabel.visible = false;
      return;
    }

    const index = satellitePositions.idToIndex.get(hoveredSatelliteId);
    const definition = satelliteDefinitions.definitions.get(hoveredSatelliteId);

    if (index === undefined || definition === undefined) {
      hoverLabel.visible = false;
      return;
    }

    hoverLabel.visible = true;
    hoverLabel.element.textContent = definition.displayName;
    hoverLabel.position.set(
      satellitePositions.scenePositions[index * 3],
      satellitePositions.scenePositions[index * 3 + 1],
      satellitePositions.scenePositions[index * 3 + 2]
    );
  };

  const updateHover = () => {
    if (!hoveredNeedsUpdate) {
      return;
    }
    hoveredNeedsUpdate = false;

    if (!pointerPosition) {
      hoveredSatelliteId = undefined;
      return;
    }

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

    for (let i = 0; i < satellitePositions.indexToId.size; i++) {
      positionInNdc
        .set(
          satellitePositions.scenePositions[i * 3],
          satellitePositions.scenePositions[i * 3 + 1],
          satellitePositions.scenePositions[i * 3 + 2]
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
        (1 + positionInNdc.x) * (canvas.offsetWidth / 2) -
        pointerPosition.offsetX;
      const dy =
        (1 - positionInNdc.y) * (canvas.offsetHeight / 2) -
        pointerPosition.offsetY;

      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < maxDistanceSq && distanceSq < closestDistanceSq) {
        closestDistanceSq = distanceSq;
        closestIndex = i;
      }
    }

    hoveredSatelliteId = closestIndex
      ? satellitePositions.indexToId.get(closestIndex)
      : undefined;
  };

  let pointerPosition: { offsetX: number; offsetY: number } | undefined;

  const setPointerPosition = (event: PointerEvent | undefined) => {
    if (
      pointerPosition?.offsetX === event?.offsetX &&
      pointerPosition?.offsetY === event?.offsetY
    ) {
      return;
    }

    pointerPosition = event
      ? {
          offsetX: event.offsetX,
          offsetY: event.offsetY,
        }
      : undefined;

    hoveredNeedsUpdate = true;
  };

  const onPointerMove = (event: PointerEvent) => {
    setPointerPosition(event);
  };
  const onPointerLeave = (_event: PointerEvent) => {
    setPointerPosition(undefined);
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);

  return {
    update: () => {
      time.update();
      satellitePositions.update();
      satellitePoints.update();
      updateHover();
      updateHoveredLabel();
      updateLabels();
    },

    dispose: () => {
      scene.remove(satellitePoints.points);
      satellitePoints.dispose();

      satellitePositions.dispose();

      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}

function lookAnglesToEuler(lookAngles: satellite.LookAngles) {
  return new Euler(lookAngles.elevation, -lookAngles.azimuth, 0, "YXZ");
}
