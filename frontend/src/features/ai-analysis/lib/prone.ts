import type { AnalysisFrame, Landmark } from '../types';

export const PRONE_MS = 10_000; // 엎드림이 이 시간 이상 지속되면 수면
const MIN_VISIBILITY = 0.5;
const HEAD_DOWN = 0.15; // (어깨선 - 코) / 어깨 너비. 엎드리면 0 근처

const seen = (p?: Landmark): p is Landmark =>
  !!p && (p.visibility ?? 0) >= MIN_VISIBILITY;

// 한 프레임에서 엎드린 상태인지
export function isProne(frame: AnalysisFrame): boolean {
  const lm = frame.pose?.landmarks;
  if (!lm) return false;
  const ls = lm[11];
  const rs = lm[12];
  if (!seen(ls) || !seen(rs)) return false;
  const width = Math.hypot(ls.x - rs.x, ls.y - rs.y);
  if (width < 0.05) return false;
  const nose = lm[0];
  if (seen(nose)) {
    return ((ls.y + rs.y) / 2 - nose.y) / width < HEAD_DOWN;
  }
  // 얼굴이 통째로 안 보이면 얼굴을 묻은 것으로 본다
  return !seen(lm[7]) && !seen(lm[8]);
}
