import { useEffect, useState } from "react";

export function DisplayGeolocationCoordinates() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoords(position.coords);
    });

    const watchId = navigator.geolocation.watchPosition((position) => {
      setCoords(position.coords);
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <pre>
      {JSON.stringify(
        coords
          ? {
              accuracy: coords.accuracy,
              altitude: coords.altitude,
              altitudeAccuracy: coords.altitudeAccuracy,
              heading: coords.heading,
              latitude: coords.latitude,
              longitude: coords.longitude,
              speed: coords.speed,
            }
          : coords,
        null,
        2
      )}
    </pre>
  );
}
