import { useEffect, useState } from "react";
import { degToRad, deviceOrientationToLookAngles } from "./rotations";

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

function RotationDisplay({ degrees }: { degrees: number }) {
  const radius = 40;
  const width = (radius + 10) * 2;
  const height = width;

  const centerX = width / 2;
  const centerY = height / 2;

  const radians = degToRad(degrees);
  const pointX = centerX + radius * Math.cos(radians);
  const pointY = centerY + radius * Math.sin(radians);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1={centerX} y1={centerY} x2={pointX} y2={pointY} stroke="black" />
    </svg>
  );
}

export function Orientation() {
  const orientation = useOrientationAbsolute();

  const lookAngles = orientation
    ? deviceOrientationToLookAngles(orientation)
    : orientation;

  return (
    <pre>
      {orientation ? (
        <>
          <p>
            Alpha: <RotationDisplay degrees={orientation.alpha ?? 0} />{" "}
            {orientation.alpha}
          </p>
          <p>
            Beta: <RotationDisplay degrees={orientation.beta ?? 0} />{" "}
            {orientation.beta}
          </p>
          <p>
            Gamma: <RotationDisplay degrees={orientation.gamma ?? 0} />{" "}
            {orientation.gamma}
          </p>
        </>
      ) : null}
      {lookAngles ? (
        <>
          <p>
            Az: <RotationDisplay degrees={lookAngles.azimuth} />{" "}
            {lookAngles.azimuth}
          </p>
          <p>
            El: <RotationDisplay degrees={lookAngles.elevation} />{" "}
            {lookAngles.elevation}
          </p>
          <p>
            Roll: <RotationDisplay degrees={lookAngles.roll} />{" "}
            {lookAngles.roll}
          </p>
        </>
      ) : null}
    </pre>
  );
}
