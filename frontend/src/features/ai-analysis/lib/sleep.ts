import type { AnalysisFrame, Landmark } from '../types';

const MIN_VISIBILITY = 0.5;
const EYES_CLOSED = 0.6; // 눈 감김 점수 기준
const HEAD_DOWN = 0.15; // (어깨선 - 코) / 어깨 너비. 엎드리면 0 근처

const seen = (p?: Landmark): p is Landmark =>
  !!p && (p.visibility ?? 0) >= MIN_VISIBILITY;

// 한 프레임에서 졸음/수면 자세로 보이는지
export function isSleepy(frame: AnalysisFrame): boolean {
  const lm = frame.pose?.landmarks;
  if (lm) {
    const nose = lm[0];
    const ls = lm[11];
    const rs = lm[12];
    if (seen(nose) && seen(ls) && seen(rs)) {
      const width = Math.hypot(ls.x - rs.x, ls.y - rs.y);
      if (width >= 0.05) {
        const shoulderY = (ls.y + rs.y) / 2;
        if ((shoulderY - nose.y) / width < HEAD_DOWN) return true;
      }
    }
  }
  return (frame.face?.eyeBlink ?? 0) >= EYES_CLOSED;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return [h, m, sec % 60].map((n) => String(n).padStart(2, '0')).join(':');
}
