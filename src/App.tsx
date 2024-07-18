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
const velocityEci = positionAndVelocity.velocity;

// Set the Observer at 122.03 West by 36.96 North, in RADIANS
const observerGd = {
  longitude: satellite.degreesToRadians(-0.00139),
  latitude: satellite.degreesToRadians(51.47783),
  height: 0.1420368,
};

// You will need GMST for some of the coordinate transforms.
// http://en.wikipedia.org/wiki/Sidereal_time#Definition
const gmst = satellite.gstime(new Date());

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
const positionEcf = satellite.eciToEcf(positionEci, gmst);
const observerEcf = satellite.geodeticToEcf(observerGd);
const positionGd = satellite.eciToGeodetic(positionEci, gmst);
const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
// dopplerFactor = satellite.dopplerFactor(
//   observerCoordsEcf,
//   positionEcf,
//   velocityEcf
// );

// The coordinates are all stored in key-value pairs.
// ECI and ECF are accessed by `x`, `y`, `z` properties.
const satelliteX = positionEci.x;
const satelliteY = positionEci.y;
const satelliteZ = positionEci.z;

// Look Angles may be accessed by `azimuth`, `elevation`, `range_sat` properties.
const azimuth = lookAngles.azimuth;
const elevation = lookAngles.elevation;
const rangeSat = lookAngles.rangeSat;

// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
const longitude = positionGd.longitude;
const latitude = positionGd.latitude;
const height = positionGd.height;

//  Convert the RADIANS to DEGREES.
const longitudeDeg = satellite.degreesLong(longitude);
const latitudeDeg = satellite.degreesLat(latitude);

export function App() {
  return (
    <>{JSON.stringify({ azimuth, elevation, latitudeDeg, longitudeDeg })}</>
  );
}
