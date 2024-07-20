// sum.test.js
import { describe, expect, test } from "vitest";
import {
  deviceOrientationToEuler,
  deviceOrientationToLookAngles,
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

describe("deviceOrientationToLookAngles", () => {
  test("transforms identity to down", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 0,
    });
    expect(lookAngles.elevation).closeTo(-90, 0.001);
  });

  test("transforms beta 90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 90,
      gamma: 0,
    });
    expect(lookAngles.elevation).closeTo(0, 0.001);
  });

  test("transforms beta -90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 90,
      gamma: 0,
    });
    expect(lookAngles.elevation).closeTo(0, 0.001);
  });

  test("transforms beta 180 to up", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 180,
      gamma: 0,
    });
    expect(lookAngles.elevation).closeTo(90, 0.001);
  });

  test("transforms gamma 90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 90,
    });
    expect(lookAngles.elevation).closeTo(0, 0.001);
  });

  test("transforms gamma -90 to horizon", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: -90,
    });
    expect(lookAngles.elevation).closeTo(0, 0.001);
  });

  test("transforms gamma 180 to up", () => {
    const lookAngles = deviceOrientationToLookAngles({
      alpha: 0,
      beta: 0,
      gamma: 180,
    });
    expect(lookAngles.elevation).closeTo(90, 0.001);
  });
});
