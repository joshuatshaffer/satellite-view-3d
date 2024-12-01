import * as satellite from "satellite.js";
import { Store } from "./jotai-types";
import { lookAnglesToPosition } from "./lookAnglesToPosition";
import { satelliteDefinitionsAtom } from "./SatelliteDefinitions";
import { radii } from "./scenePositions";
import { observerGdAtom } from "./settings";
import { timeAtom } from "./Time";

export class SatellitePositions {
  public needsUpdate = false;
  public readonly dependents = new Set<{ needsUpdate: boolean }>();

  public scenePositions = new Float32Array(
    3 * this.store.get(satelliteDefinitionsAtom).records.size
  );
  public readonly indexToId = new Map<number, string>();
  public readonly idToIndex = new Map<string, number>();

  constructor(private readonly store: Store) {}

  private readonly onNeedsUpdate = () => {
    this.needsUpdate = true;
  };

  private readonly unsubscribeObserverGdAtom = this.store.sub(
    observerGdAtom,
    this.onNeedsUpdate
  );

  private readonly unsubscribeSatelliteDefinitionsAtom = this.store.sub(
    satelliteDefinitionsAtom,
    this.onNeedsUpdate
  );

  private readonly unsubscribeTimeAtom = this.store.sub(
    timeAtom,
    this.onNeedsUpdate
  );

  dispose() {
    this.unsubscribeObserverGdAtom();
    this.unsubscribeSatelliteDefinitionsAtom();
    this.unsubscribeTimeAtom();
  }

  update() {
    if (!this.needsUpdate) {
      return;
    }
    this.needsUpdate = false;

    const { records } = this.store.get(satelliteDefinitionsAtom);
    const nowDate = this.store.get(timeAtom);

    if (records.size * 3 > this.scenePositions.length) {
      this.scenePositions = new Float32Array(3 * records.size);
    }

    const nowGmst = satellite.gstime(nowDate);

    const observerGd = this.store.get(observerGdAtom);

    this.indexToId.clear();
    this.idToIndex.clear();
    for (const [id, record] of records) {
      const positionAndVelocity = satellite.propagate(record, nowDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        continue;
      }

      const positionEcf = satellite.eciToEcf(positionEci, nowGmst);

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      const index = this.indexToId.size;

      this.scenePositions.set(
        lookAnglesToPosition(lookAngles, radii.satellitePoint).toArray(),
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
