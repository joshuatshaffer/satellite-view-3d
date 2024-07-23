export function initCameraPassthrough(videoElement: HTMLVideoElement) {
  const update = () => {
    if (document.visibilityState === "visible") {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          videoElement.srcObject = stream;
        });
    } else {
      videoElement.srcObject = null;
    }
  };

  update();
  document.addEventListener("visibilitychange", update);
}
