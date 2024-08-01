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
import { observerGd } from "./observer";
import { north } from "./sceneSpaceDirections";

type Tle = [line1: string, line2: string];

interface SatelliteDefinition {
  displayName: string;
  tle: Tle;
}

export function makeSatellites(scene: Scene) {
  let definitions: SatelliteDefinition[] = [
    {
      displayName: "ISS",
      tle: [
        "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997",
        "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357",
      ],
    },
    {
      displayName: "NOAA 15",
      tle: [
        "1 25338U 98030A   24205.56694301  .00000578  00000-0  25704-3 0  9999",
        "2 25338  98.5672 231.9320 0009648 212.5949 147.4637 14.26637206362379",
      ],
    },
    {
      displayName: "NOAA 18",
      tle: [
        "1 28654U 05018A   24205.45690124  .00000515  00000-0  29850-3 0  9991",
        "2 28654  98.8737 282.1203 0013415 323.8830  36.1435 14.13261241988291",
      ],
    },
    {
      displayName: "NOAA 19",
      tle: [
        "1 33591U 09005A   24205.55510556  .00000493  00000-0  28834-3 0  9994",
        "2 33591  99.0451 261.7357 0013813 185.5094 174.5927 14.13055684796509",
      ],
    },
    {
      displayName: "TERRA",
      tle: [
        "1 25994U 99068A   24213.85505919  .00001005  00000-0  21923-3 0  9991",
        "2 25994  98.0456 276.0273 0001537 179.5994 292.3844 14.59898035309680",
      ],
    },
    {
      displayName: "AQUA",
      tle: [
        "1 27424U 02022A   24213.86092038  .00001804  00000-0  38962-3 0  9997",
        "2 27424  98.3321 163.4090 0001436  52.6227 330.1072 14.59543994183234",
      ],
    },
    {
      displayName: "METOP-B",
      tle: [
        "1 38771U 12049A   24213.87094016  .00000272  00000-0  14417-3 0  9990",
        "2 38771  98.6253 270.0840 0001012  83.5005 276.6288 14.21459438615896",
      ],
    },
    {
      displayName: "SUOMI NPP",
      tle: [
        "1 37849U 11061A   24213.87109248  .00000199  00000-0  11505-3 0  9995",
        "2 37849  98.7222 151.1814 0001860 105.7264 254.4117 14.19537762661208",
      ],
    },
    {
      displayName: "FOX-1A (AO-85)",
      tle: [
        "1 40967U 15058D   24213.51377705  .00005445  00000-0  50387-3 0  9996",
        "2 40967  64.7760 239.5485 0191650 290.6079  67.4565 14.82602789 11562",
      ],
    },
  ];

  let records = definitions.map((d) =>
    satellite.twoline2satrec(d.tle[0], d.tle[1])
  );

  let indexMap: number[] = [];

  let scenePositions = new Float32Array(3 * records.length);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(scenePositions, 3));
  geometry.setDrawRange(0, indexMap.length);

  const particles = new Points(
    geometry,
    new PointsMaterial({ size: 5, color: 0xff0000, sizeAttenuation: false })
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

  const labels = Array.from({ length: records.length }, () => {
    const text = document.createElement("div");
    text.className = "label";

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
