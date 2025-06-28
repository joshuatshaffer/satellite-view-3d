import { Atom } from "jotai";
import { Store } from "../jotai-types";
import { satelliteDefinitionsAtom } from "../SatelliteDefinitions";
import { observerGdAtom } from "../settings";
import { timeAtom } from "../Time";
import type { Output, ToPositionsWorker } from "./worker";
import PositionsWorker from "./worker?worker";

export type SatellitePositions = ReturnType<typeof makeSatellitePositions>;

export function makeSatellitePositions(store: Store) {
  const worker = new PositionsWorker();

  const disposeCallbacks: (() => void)[] = [];

  const watchAtom = <T>(atom: Atom<T>, update: (value: T) => void) => {
    disposeCallbacks.push(
      store.sub(atom, () => {
        update(store.get(atom));
      })
    );
    update(store.get(atom));
  };

  let updateMessage: ToPositionsWorker = {};

  watchAtom(observerGdAtom, (observerGd) => {
    updateMessage.observerGd = observerGd;
  });

  watchAtom(satelliteDefinitionsAtom, ({ records }) => {
    updateMessage.records = records;
  });

  watchAtom(timeAtom, (nowDate) => {
    updateMessage.nowDate = nowDate;
  });

  const update = () => {
    if (Object.values(updateMessage).some((v) => v !== undefined)) {
      worker.postMessage(updateMessage);
      updateMessage = {};
    }
  };

  const onMessage = (event: MessageEvent<Output>) => {
    satellitePositions.indexToId = event.data.indexToId;
    satellitePositions.idToIndex = event.data.idToIndex;

    if (
      satellitePositions.scenePositions.length ===
      event.data.scenePositions.length
    ) {
      satellitePositions.scenePositions.set(event.data.scenePositions);
    } else {
      satellitePositions.scenePositions = event.data.scenePositions;
    }

    for (const dependent of satellitePositions.dependents) {
      dependent.needsUpdate = true;
    }
  };

  worker.addEventListener("message", onMessage);

  const dispose = () => {
    worker.removeEventListener("message", onMessage);

    for (const disposeCallback of disposeCallbacks) {
      disposeCallback();
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
