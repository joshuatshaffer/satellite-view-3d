export function initCameraPassthrough(videoElement: HTMLVideoElement) {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      videoElement.srcObject = stream;
    });
}
