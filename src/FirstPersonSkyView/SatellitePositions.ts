import * as satellite from "satellite.js";
import { Store } from "./jotai-types";
import { lookAnglesToPosition } from "./lookAnglesToPosition";
import { satelliteDefinitionsAtom } from "./SatelliteDefinitions";
import { radii } from "./scenePositions";
import { observerGdAtom } from "./settings";
import { timeAtom } from "./Time";

export type SatellitePositions = ReturnType<typeof makeSatellitePositions>;

export function makeSatellitePositions(store: Store) {
  let needsUpdate = false;

  const onNeedsUpdate = () => {
    needsUpdate = true;
  };

  const unsubscribeObserverGdAtom = store.sub(observerGdAtom, onNeedsUpdate);

  const unsubscribeSatelliteDefinitionsAtom = store.sub(
    satelliteDefinitionsAtom,
    onNeedsUpdate
  );

  const unsubscribeTimeAtom = store.sub(timeAtom, onNeedsUpdate);

  const dispose = () => {
    unsubscribeObserverGdAtom();
    unsubscribeSatelliteDefinitionsAtom();
    unsubscribeTimeAtom();
  };

  const update = () => {
    if (!needsUpdate) {
      return;
    }
    needsUpdate = false;

    const { records } = store.get(satelliteDefinitionsAtom);
    const nowDate = store.get(timeAtom);

    if (records.size * 3 > satellitePositions.scenePositions.length) {
      satellitePositions.scenePositions = new Float32Array(3 * records.size);
    }

    const nowGmst = satellite.gstime(nowDate);

    const observerGd = store.get(observerGdAtom);

    satellitePositions.indexToId.clear();
    satellitePositions.idToIndex.clear();
    for (const [id, record] of records) {
      const positionAndVelocity = satellite.propagate(record, nowDate);

      const positionEci = positionAndVelocity.position;

      if (typeof positionEci !== "object") {
        continue;
      }

      const positionEcf = satellite.eciToEcf(positionEci, nowGmst);

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      const index = satellitePositions.indexToId.size;

      satellitePositions.scenePositions.set(
        lookAnglesToPosition(lookAngles, radii.satellitePoint).toArray(),
        index * 3
      );

      satellitePositions.indexToId.set(index, id);
      satellitePositions.idToIndex.set(id, index);
    }

    for (const dependent of satellitePositions.dependents) {
      dependent.needsUpdate = true;
    }
  };

  const satellitePositions = {
    dependents: new Set<{ needsUpdate: boolean }>(),

    scenePositions: new Float32Array(
      3 * store.get(satelliteDefinitionsAtom).records.size
    ),
    indexToId: new Map<number, string>(),
    idToIndex: new Map<string, number>(),

    update,
    dispose,
  };

  return satellitePositions;
}
