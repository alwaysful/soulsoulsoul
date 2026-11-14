export async function openWebcam(
  video: HTMLVideoElement,
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  try {
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    // play 실패 시 스트림이 호출자에게 전달되지 않으므로 여기서 해제
    closeWebcam(video, stream);
    throw e;
  }
  return stream;
}

export function closeWebcam(
  video: HTMLVideoElement | null,
  stream: MediaStream | null,
): void {
  stream?.getTracks().forEach((t) => t.stop());
  if (video) video.srcObject = null;
}
