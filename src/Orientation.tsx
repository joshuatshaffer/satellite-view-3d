import { useEffect, useState } from "react";

function useOrientationAbsolute() {
  const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(
    null
  );
  useEffect(() => {
    const handler = (event: DeviceOrientationEvent) => setOrientation(event);
    window.addEventListener("deviceorientationabsolute", handler);
    return () =>
      window.removeEventListener("deviceorientationabsolute", handler);
  }, []);
  return orientation;
}

export function Orientation() {
  const orientationAbsolute = useOrientationAbsolute();
  return (
    <pre>
      {JSON.stringify(
        {
          orientationAbsolute: orientationAbsolute
            ? {
                absolute: orientationAbsolute.absolute,
                alpha: orientationAbsolute.alpha,
                beta: orientationAbsolute.beta,
                gamma: orientationAbsolute.gamma,
              }
            : orientationAbsolute,
        },
        null,
        2
      )}
    </pre>
  );
}
