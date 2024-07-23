import * as satellite from "satellite.js";
import { degToRad } from "./rotations";

const royalGreenwichObservatoryGd: satellite.GeodeticLocation = {
  latitude: degToRad(51.47783),
  longitude: degToRad(-0.00139),
  height: 68 / 1000,
};

export let observerGd: satellite.GeodeticLocation = royalGreenwichObservatoryGd;

window.navigator.geolocation.watchPosition((newPosition) => {
  observerGd = {
    latitude: degToRad(newPosition.coords.latitude),
    longitude: degToRad(newPosition.coords.longitude),
    height:
      newPosition.coords.altitude !== null
        ? newPosition.coords.altitude / 1000
        : observerGd.height,
  };
});
