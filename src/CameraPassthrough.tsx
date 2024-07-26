import { useEffect, useState } from "react";
import { useAsync } from "./useAsync";
import { useVisibilityState } from "./useVisibilityState";

function getStream() {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });
}

export function CameraPassthrough() {
  const stream = useAsync(getStream);

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );

  const visibilityState = useVisibilityState();

  useEffect(() => {
    if (!videoElement || stream.status !== "fulfilled") {
      return;
    }

    if (visibilityState !== "visible") {
      videoElement.srcObject = null;
      return;
    }

    videoElement.srcObject = stream.value;
  }, [stream, videoElement, visibilityState]);

  return (
    <video
      ref={setVideoElement}
      id="camera-passthrough"
      autoPlay
      playsInline
      muted
    />
  );
}
