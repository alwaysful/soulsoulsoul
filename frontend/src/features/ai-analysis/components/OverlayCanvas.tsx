import { useEffect, useRef } from 'react';
import type { AnalysisFrame } from '../types';

// 상체 관절 인덱스 (MediaPipe Pose)
const POINTS = [0, 11, 12, 13, 14, 15, 16];
const LINKS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
];
const MIN_VISIBILITY = 0.5;

interface Props {
  frame: AnalysisFrame | null;
  video: HTMLVideoElement | null;
}

export function OverlayCanvas({ frame, video }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    if (!frame) return;

    const lm = frame.pose?.landmarks;
    if (lm) {
      const ok = (i: number) => (lm[i]?.visibility ?? 0) >= MIN_VISIBILITY;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4fb3d4';
      for (const [a, b] of LINKS) {
        if (!ok(a) || !ok(b)) continue;
        ctx.beginPath();
        ctx.moveTo(lm[a].x * w, lm[a].y * h);
        ctx.lineTo(lm[b].x * w, lm[b].y * h);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd400';
      for (const i of POINTS) {
        if (!ok(i)) continue;
        ctx.beginPath();
        ctx.arc(lm[i].x * w, lm[i].y * h, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff4d4f';
    ctx.fillStyle = '#ff4d4f';
    ctx.font = '16px sans-serif';
    for (const o of frame.objects) {
      ctx.strokeRect(o.box.x, o.box.y, o.box.width, o.box.height);
      ctx.fillText(
        `${o.label} ${o.score.toFixed(2)}`,
        o.box.x + 4,
        Math.max(16, o.box.y - 6),
      );
    }
  }, [frame, video]);

  return <canvas ref={ref} className="analysis-overlay" />;
}
