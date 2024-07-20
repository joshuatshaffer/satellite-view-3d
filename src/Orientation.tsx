import { useEffect, useState } from "react";

function useOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(
    null
  );
  useEffect(() => {
    const handler = (event: DeviceOrientationEvent) => setOrientation(event);
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);
  return orientation;
}

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

function useMotion() {
  const [motion, setMotion] = useState<DeviceMotionEvent | null>(null);
  useEffect(() => {
    const handler = (event: DeviceMotionEvent) => setMotion(event);
    window.addEventListener("devicemotion", handler);
    return () => window.removeEventListener("devicemotion", handler);
  }, []);
  return motion;
}

export function Orientation() {
  const orientation = useOrientation();
  const orientationAbsolute = useOrientationAbsolute();
  const motion = useMotion();
  return (
    <pre>
      {JSON.stringify(
        {
          orientation: orientation
            ? {
                absolute: orientation.absolute,
                alpha: orientation.alpha,
                beta: orientation.beta,
                gamma: orientation.gamma,
              }
            : orientation,
          orientationAbsolute: orientationAbsolute
            ? {
                absolute: orientationAbsolute.absolute,
                alpha: orientationAbsolute.alpha,
                beta: orientationAbsolute.beta,
                gamma: orientationAbsolute.gamma,
              }
            : orientationAbsolute,
          motion: motion
            ? {
                acceleration: motion.acceleration
                  ? {
                      x: motion.acceleration.x,
                      y: motion.acceleration.y,
                      z: motion.acceleration.z,
                    }
                  : motion.acceleration,
                accelerationIncludingGravity:
                  motion.accelerationIncludingGravity
                    ? {
                        x: motion.accelerationIncludingGravity.x,
                        y: motion.accelerationIncludingGravity.y,
                        z: motion.accelerationIncludingGravity.z,
                      }
                    : motion.accelerationIncludingGravity,
                interval: motion.interval,
                rotationRate: motion.rotationRate
                  ? {
                      alpha: motion.rotationRate.alpha,
                      beta: motion.rotationRate.beta,
                      gamma: motion.rotationRate.gamma,
                    }
                  : motion.rotationRate,
              }
            : motion,
        },
        null,
        2
      )}
    </pre>
  );
}
