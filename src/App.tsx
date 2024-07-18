import * as satellite from "satellite.js";

// Sample TLE
const tleLine1 =
  "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997";
const tleLine2 =
  "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357";

// Initialize a satellite record
const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

//  Or you can use a JavaScript Date
const positionAndVelocity = satellite.propagate(satrec, new Date());

// The position_velocity result is a key-value pair of ECI coordinates.
// These are the base results from which all other coordinates are derived.
const positionEci = positionAndVelocity.position;
if (typeof positionEci !== "object") {
  throw new Error("Position is not an object.");
}

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
const observerGd = {
  latitude: satellite.degreesToRadians(51.47783),
  longitude: satellite.degreesToRadians(-0.00139),
  height: 0.1420368,
};

// You will need GMST for some of the coordinate transforms.
// http://en.wikipedia.org/wiki/Sidereal_time#Definition
const gmst = satellite.gstime(new Date());

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
const positionEcf = satellite.eciToEcf(positionEci, gmst);
const positionGd = satellite.eciToGeodetic(positionEci, gmst);
const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

export function App() {
  return (
    <>
      {JSON.stringify({
        azimuth: lookAngles.azimuth * (180 / Math.PI),
        elevation: lookAngles.elevation * (180 / Math.PI),
        latitudeDeg: satellite.degreesLat(positionGd.latitude),
        longitudeDeg: satellite.degreesLong(positionGd.longitude),
        height: positionGd.height,
      })}
    </>
  );
}
