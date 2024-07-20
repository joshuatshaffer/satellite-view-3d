// sum.test.js
import { describe, expect, test } from "vitest";
import {
  deviceOrientationToEuler,
  deviceOrientationToLookAngles,
  deviceOrientationToQuaternion,
} from "./rotations";

describe("deviceOrientationToEuler", () => {
  test("transforms identity to identity", () => {
    const orientation = { alpha: 0, beta: 0, gamma: 0 };
    const euler = deviceOrientationToEuler(orientation);
    expect(euler.x).equal(0);
    expect(euler.y).equal(0);
    expect(euler.z).equal(0);
  });
});

describe("deviceOrientationToQuaternion", () => {
  test("transforms identity to identity", () => {
    const orientation = { alpha: 0, beta: 0, gamma: 0 };
    const quaternion = deviceOrientationToQuaternion(orientation);
    expect(quaternion.x).equal(0);
    expect(quaternion.y).equal(0);
    expect(quaternion.z).equal(0);
    expect(quaternion.w).equal(1);
  });
});

describe("deviceOrientationToLookAngles", () => {
  test("transforms identity to down", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 0,
    });
    expect(lookAngles.elevation).equal(-90);
  });

  test("transforms beta 90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 90,
      gamma: 0,
    });
    expect(lookAngles.elevation).equal(0);
  });

  test("transforms beta -90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 90,
      gamma: 0,
    });
    expect(lookAngles.elevation).equal(0);
  });

  test("transforms beta 180 to up", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 180,
      gamma: 0,
    });
    expect(lookAngles.elevation).equal(90);
  });

  test("transforms gamma 90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 90,
    });
    expect(lookAngles.elevation).equal(0);
  });

  test("transforms gamma -90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: -90,
    });
    expect(lookAngles.elevation).equal(0);
  });

  test("transforms gamma 180 to up", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 180,
    });
    expect(lookAngles.elevation).equal(90);
  });
});
