import { isNotNullish } from "./isNullish";
import { radToDeg } from "./rotations";

export interface AngleUnits {
  radians?: number;
  degrees?: number;
  minutes?: number;
  seconds?: number;
}

export function degToDms(value: number) {
  const degrees = Math.floor(value);
  value -= degrees;
  value *= 60;
  const minutes = Math.floor(value);
  value -= minutes;
  value *= 60;
  const seconds = value;

  return {
    degrees,
    minutes,
    seconds,
  } satisfies AngleUnits;
}

export function angleUnitsToDegrees({
  radians = 0,
  degrees = 0,
  minutes = 0,
  seconds = 0,
}: AngleUnits) {
  return radToDeg(radians) + degrees + minutes / 60 + seconds / 3600;
}

export function formatAngleUnits({
  radians,
  degrees,
  minutes,
  seconds,
}: AngleUnits) {
  return [
    isNotNullish(radians) ? `${radians} rad` : null,
    isNotNullish(degrees) ? `${degrees}°` : null,
    isNotNullish(minutes) ? `${minutes}'` : null,
    isNotNullish(seconds) ? `${seconds.toFixed(2)}"` : null,
  ]
    .filter(isNotNullish)
    .join(" ");
}
