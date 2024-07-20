import { useEffect, useState } from "react";
import * as satellite from "satellite.js";
import * as THREE from "three";
import { degToRad, deviceOrientationToEuler } from "./rotations";

const north = () => new THREE.Vector3(0, 0, -1);
const east = () => new THREE.Vector3(1, 0, 0);
const south = () => new THREE.Vector3(0, 0, 1);
const west = () => new THREE.Vector3(-1, 0, 0);
const up = () => new THREE.Vector3(0, 1, 0);
const down = () => new THREE.Vector3(0, -1, 0);

const tleLine1 =
  "1 25544U 98067A   24200.15235088  .00018477  00000+0  33066-3 0  9997";
const tleLine2 =
  "2 25544  51.6371 161.9379 0010265  78.7950 281.4192 15.49981173463357";

const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

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

// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
const lookAngles = satellite.ecfToLookAngles(
  observerGd,
  satellite.eciToEcf(positionEci, satellite.gstime(new Date()))
);

export function Compass() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          ...north().multiplyScalar(100).toArray(),
          ...east().multiplyScalar(100).toArray(),
          ...down().multiplyScalar(100).toArray(),
          ...north()
            .applyEuler(
              new THREE.Euler(lookAngles.elevation, -lookAngles.azimuth, 0)
            )
            .multiplyScalar(100)
            .toArray(),
        ]),
        3
      )
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1]),
        3
      )
    );

    const particles = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 2, vertexColors: true })
    );
    scene.add(particles);

    let orientation: DeviceOrientationEvent | null = null;

    window.addEventListener(
      "deviceorientationabsolute",
      (event: DeviceOrientationEvent) => {
        orientation = event;
      }
    );

    function animate() {
      if (orientation) {
        camera.quaternion.setFromEuler(deviceOrientationToEuler(orientation));
        camera.quaternion.premultiply(
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(degToRad(-90), 0, 0, "XYZ")
          )
        );
      }

      renderer.render(scene, camera);
    }
  }, [canvas]);

  return (
    <canvas
      ref={setCanvas}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
