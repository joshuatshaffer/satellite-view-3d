import * as satellite from "satellite.js";
import * as THREE from "three";
import { north } from "./sceneSpaceDirections";

let observerGd = {
  latitude: satellite.degreesToRadians(51.47783),
  longitude: satellite.degreesToRadians(-0.00139),
  height: 0.1420368,
};

window.navigator.geolocation.watchPosition((newPosition) => {
  observerGd = {
    latitude: satellite.degreesToRadians(newPosition.coords.latitude),
    longitude: satellite.degreesToRadians(newPosition.coords.longitude),
    height:
      newPosition.coords.altitude !== null
        ? newPosition.coords.altitude / 1000
        : observerGd.height,
  };
});

export function getSatPosition() {
  const now = new Date();

  const satrec = satellite.twoline2satrec(
    "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997",
    "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357"
  );

  const positionAndVelocity = satellite.propagate(satrec, now);

  // The position_velocity result is a key-value pair of ECI coordinates.
  // These are the base results from which all other coordinates are derived.
  const positionEci = positionAndVelocity.position;
  if (typeof positionEci !== "object") {
    throw new Error("Position is not an object.");
  }

  // You will need GMST for some of the coordinate transforms.
  // http://en.wikipedia.org/wiki/Sidereal_time#Definition
  // You can get ECF, Geodetic, Look Angles, and Doppler Factor.
  const lookAngles = satellite.ecfToLookAngles(
    observerGd,
    satellite.eciToEcf(positionEci, satellite.gstime(now))
  );

  return north()
    .applyEuler(new THREE.Euler(lookAngles.elevation, -lookAngles.azimuth, 0))
    .multiplyScalar(100);
}
