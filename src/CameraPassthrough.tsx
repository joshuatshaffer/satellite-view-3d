import { useEffect, useState } from "react";

export function CameraPassthrough() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  useEffect(() => {
    if (!videoElement) {
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        videoElement.srcObject = stream;
      });
  }, [videoElement]);

  return (
    <video
      ref={setVideoElement}
      autoPlay
      playsInline
      muted
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
