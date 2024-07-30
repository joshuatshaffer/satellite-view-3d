import { Scene } from "three";
import { Satellite } from "./Satellite";

export function makeSatellites(scene: Scene) {
  const satellites = [
    new Satellite(
      "ISS",
      "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997",
      "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357"
    ),
    new Satellite(
      "NOAA 15",
      "1 25338U 98030A   24205.56694301  .00000578  00000-0  25704-3 0  9999",
      "2 25338  98.5672 231.9320 0009648 212.5949 147.4637 14.26637206362379"
    ),
    new Satellite(
      "NOAA 18",
      "1 28654U 05018A   24205.45690124  .00000515  00000-0  29850-3 0  9991",
      "2 28654  98.8737 282.1203 0013415 323.8830  36.1435 14.13261241988291"
    ),
    new Satellite(
      "NOAA 19",
      "1 33591U 09005A   24205.55510556  .00000493  00000-0  28834-3 0  9994",
      "2 33591  99.0451 261.7357 0013813 185.5094 174.5927 14.13055684796509"
    ),
  ];

  for (const sat of satellites) {
    scene.add(sat.object3D);
    if (sat.nextPassLine) {
      scene.add(sat.nextPassLine);
    }
  }

  return {
    update: () => {
      for (const satellite of satellites) {
        satellite.update();
      }
    },

    dispose: () => {
      for (const sat of satellites) {
        scene.remove(sat.object3D);
        if (sat.nextPassLine) {
          scene.remove(sat.nextPassLine);
        }
      }
    },
  };
}
