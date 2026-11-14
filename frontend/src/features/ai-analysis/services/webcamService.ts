export async function openWebcam(
  video: HTMLVideoElement,
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function closeWebcam(
  video: HTMLVideoElement | null,
  stream: MediaStream | null,
): void {
  stream?.getTracks().forEach((t) => t.stop());
  if (video) video.srcObject = null;
}
