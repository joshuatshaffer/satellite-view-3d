import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
} from "three";
import { Store } from "./jotai-types";
import { SatellitePositions } from "./SatellitePositions/SatellitePositions";
import { searchResultsAtom } from "./UiOverlay/Search/Search";
import {
  highlightedSatelliteIdsAtom,
  selectedSatelliteIdAtom,
} from "./urlAtom";

const selectedColor = new Color("#0f0").toArray();
const highlightedColor = new Color("#ff0").toArray();
const inResultsColor = new Color("#f00").toArray();
const notInResultsColor = new Color("#222").toArray();

export function makeSatellitePoints(
  store: Store,
  satellitePositions: SatellitePositions
) {
  const points = new Points(
    new BufferGeometry(),
    new PointsMaterial({
      size: 2,
      sizeAttenuation: false,
      vertexColors: true,
    })
  );

  points.geometry.setAttribute(
    "position",
    new BufferAttribute(satellitePositions.scenePositions, 3)
  );
  points.geometry.setAttribute(
    "color",
    new BufferAttribute(
      new Float32Array(satellitePositions.scenePositions.length),
      3
    )
  );
  points.geometry.setDrawRange(0, satellitePositions.indexToId.size);

  const updateColors = () => {
    const selectedId = store.get(selectedSatelliteIdAtom);
    const highlightedSatelliteIds = new Set(
      store.get(highlightedSatelliteIdsAtom)
    );

    const results = new Set(store.get(searchResultsAtom).map((x) => x.noradId));

    for (const [index, id] of satellitePositions.indexToId.entries()) {
      points.geometry.attributes.color.array.set(
        id === selectedId
          ? selectedColor
          : highlightedSatelliteIds.has(id)
            ? highlightedColor
            : results.has(id)
              ? inResultsColor
              : notInResultsColor,
        index * 3
      );
    }

    points.geometry.attributes.color.needsUpdate = true;
  };
  updateColors();
  const unsubscribeSearchResultsAtom = store.sub(
    searchResultsAtom,
    updateColors
  );
  const unsubscribeSelectedSatelliteIdAtom = store.sub(
    selectedSatelliteIdAtom,
    updateColors
  );
  const unsubscribeHighlightedSatelliteIdsAtom = store.sub(
    highlightedSatelliteIdsAtom,
    updateColors
  );

  const dependencyRef = {
    needsUpdate: false,
  };

  satellitePositions.dependents.add(dependencyRef);

  const dispose = () => {
    unsubscribeSearchResultsAtom();
    unsubscribeSelectedSatelliteIdAtom();
    unsubscribeHighlightedSatelliteIdsAtom();
    satellitePositions.dependents.delete(dependencyRef);
    points.geometry.dispose();
    points.material.dispose();
  };

  const update = () => {
    if (!dependencyRef.needsUpdate) {
      return;
    }
    dependencyRef.needsUpdate = false;

    if (
      points.geometry.attributes.position.array !==
      satellitePositions.scenePositions
    ) {
      console.log("Recreating geometry");

      points.geometry.dispose();
      points.geometry = new BufferGeometry();
      points.geometry.setAttribute(
        "position",
        new BufferAttribute(satellitePositions.scenePositions, 3)
      );
      points.geometry.setAttribute(
        "color",
        new BufferAttribute(
          new Float32Array(satellitePositions.scenePositions.length),
          3
        )
      );

      updateColors();
    }

    points.geometry.setDrawRange(0, satellitePositions.indexToId.size);
    points.geometry.attributes.position.needsUpdate = true;
  };

  return { points, update, dispose };
}
