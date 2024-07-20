import * as THREE from "three";

export const north = () => new THREE.Vector3(0, 0, -1);
export const east = () => new THREE.Vector3(1, 0, 0);
export const south = () => new THREE.Vector3(0, 0, 1);
export const west = () => new THREE.Vector3(-1, 0, 0);
export const up = () => new THREE.Vector3(0, 1, 0);
export const down = () => new THREE.Vector3(0, -1, 0);
