import { PerspectiveCamera, Scene } from "three";
import { Store } from "./jotai-types";
import { makeSatelliteLabel } from "./SatelliteLabel/makeSatelliteLabel";
import { makeSatelliteOffscreenPointer } from "./SatelliteLabel/makeSatelliteOffscreenPointer";
import { SatellitePositions } from "./SatellitePositions";
import { highlightedSatelliteIdsAtom } from "./urlAtom";

export function makeHighlightedSatelliteLabels({
  scene,
  hudRoot,
  satellitePositions,
  store,
  camera,
}: {
  scene: Scene;
  hudRoot: HTMLDivElement;
  satellitePositions: SatellitePositions;
  store: Store;
  camera: PerspectiveCamera;
}) {
  const makeHighlightedSatelliteLabel = () => ({
    label: makeSatelliteLabel(scene, satellitePositions, store),
    offscreenPointer: makeSatelliteOffscreenPointer({
      hudRoot,
      satellitePositions,
      store,
      camera,
    }),
  });

  const highlightedSatelliteLabels = Array.from(
    { length: store.get(highlightedSatelliteIdsAtom).length },
    makeHighlightedSatelliteLabel
  );

  const update = () => {
    const highlightedSatelliteIds = store.get(highlightedSatelliteIdsAtom);

    while (highlightedSatelliteIds.length > highlightedSatelliteLabels.length) {
      highlightedSatelliteLabels.push(makeHighlightedSatelliteLabel());
    }

    while (highlightedSatelliteIds.length < highlightedSatelliteLabels.length) {
      const x = highlightedSatelliteLabels.pop()!;
      x.label.dispose();
      x.offscreenPointer.dispose();
    }

    for (const [
      index,
      { label, offscreenPointer },
    ] of highlightedSatelliteLabels.entries()) {
      label.update(highlightedSatelliteIds[index]);
      offscreenPointer.update(highlightedSatelliteIds[index]);
    }
  };

  const dispose = () => {
    for (const x of highlightedSatelliteLabels) {
      x.label.dispose();
    }
  };

  return {
    update,
    dispose,
  };
}
