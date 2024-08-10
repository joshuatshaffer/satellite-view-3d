import * as satellite from "satellite.js";
import { Store } from "./jotai-types";
import { lookAnglesToPosition } from "./lookAnglesToPosition";
import { SatelliteDefinitions } from "./SatelliteDefinitions";
import { observerGdAtom } from "./settings";
import { Time } from "./Time";

export class SatellitePositions {
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
        lookAnglesToPosition(lookAngles).toArray(),
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
