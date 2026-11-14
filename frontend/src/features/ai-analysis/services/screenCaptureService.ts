const MAX_WIDTH = 1280;
const QUALITY = 0.6;

export interface ScreenSession {
  // JPEG base64 (접두어 없음). 아직 프레임이 없으면 null
  capture: () => string | null;
  onEnded: (cb: () => void) => void;
  close: () => void;
}

export async function openScreen(): Promise<ScreenSession> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
  const video = document.createElement('video');
  video.muted = true;
  video.srcObject = stream;
  try {
    await video.play();
  } catch (e) {
    stream.getTracks().forEach((t) => t.stop());
    throw e;
  }
  const canvas = document.createElement('canvas');

  return {
    capture() {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return null;
      const scale = Math.min(1, MAX_WIDTH / w);
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', QUALITY).split(',')[1] ?? null;
    },
    onEnded(cb) {
      stream.getVideoTracks()[0]?.addEventListener('ended', cb);
    },
    close() {
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    },
  };
}
