import * as satellite from "satellite.js";
import type { NoradId } from "../../satdb/db";
import { lookAnglesToPosition } from "../lookAnglesToPosition";
import { radii } from "../scenePositions";

interface Input {
  records: ReadonlyMap<NoradId, satellite.SatRec>;
  nowDate: Date;
  observerGd: satellite.GeodeticLocation;
}

export interface Output {
  scenePositions: Float32Array<ArrayBuffer>;
  indexToId: Map<number, NoradId>;
  idToIndex: Map<NoradId, number>;
}

export type ToPositionsWorker = Partial<Input>;

const input: Partial<Input> = {};

let animationFrame: number | undefined;

const satellitePositions: Output = {
  scenePositions: new Float32Array(),
  indexToId: new Map(),
  idToIndex: new Map(),
};

addEventListener("message", (event: MessageEvent<ToPositionsWorker>) => {
  Object.assign(input, event.data);

  // Store the animationFrame in a variable so that we only request one at a time.
  animationFrame ??= requestAnimationFrame(update);
});

function update() {
  animationFrame = undefined;

  const { records, nowDate, observerGd } = input;
  if (
    nowDate === undefined ||
    observerGd === undefined ||
    records === undefined
  ) {
    return;
  }

  if (records.size * 3 > satellitePositions.scenePositions.length) {
    satellitePositions.scenePositions = new Float32Array(3 * records.size);
  }

  const nowGmst = satellite.gstime(nowDate);

  satellitePositions.indexToId.clear();
  satellitePositions.idToIndex.clear();
  for (const [id, record] of records) {
    const positionAndVelocity = satellite.propagate(record, nowDate);

    const positionEci = positionAndVelocity?.position;

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

  postMessage(satellitePositions);
}
