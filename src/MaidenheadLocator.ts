import { clamp } from "./clamp";
import { wrap } from "./wrap";

/**
 * Converts coordinates to a maidenhead grid code.
 *
 * Based on https://github.com/paulirwin/Maidenhead
 *
 * @param precision The precision of the grid code, in the range 1-5. Defaults to 3 for a 6-character code.
 * @returns Returns the grid code, twice the length of the specified precision.
 */
export function coordinatesToGridCode(
  { latitude, longitude }: { latitude: number; longitude: number },
  precision: number = 3
): string {
  let lat = clamp(latitude + 90, 0, 180) / 10 + 0.0000001;
  let lon = wrap(longitude + 180, 0, 360) / 20 + 0.0000001;

  let locator =
    numberToLetter(Math.floor(lon)).toUpperCase() +
    numberToLetter(Math.floor(lat)).toUpperCase();

  for (let counter = 0; counter < precision - 1; counter++) {
    const divisor = counter % 2 === 0 ? 10 : 24;

    lat = (lat - Math.floor(lat)) * divisor;
    lon = (lon - Math.floor(lon)) * divisor;

    if (counter % 2 == 0) {
      locator += Math.floor(lon).toString() + Math.floor(lat).toString();
    } else {
      locator +=
        numberToLetter(Math.floor(lon)) + numberToLetter(Math.floor(lat));
    }
  }

  return locator;
}

/**
 * Returns the lowercase letter corresponding to the specified number.
 *
 * `0 -> 'a'`, `1 -> 'b'`, etc.
 */
function numberToLetter(number: number): string {
  // 97 is the code point for 'a'.
  return String.fromCharCode(97 + number);
}
