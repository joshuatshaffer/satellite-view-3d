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

  return <video ref={setVideoElement} autoPlay playsInline muted />;
}
