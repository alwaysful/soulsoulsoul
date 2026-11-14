import type { Landmark } from '../types';

const MIN_VISIBILITY = 0.5;
const BASELINE_KEY = 'postureBaseline';

// ratio = (어깨 중심 y - 귀 중심 y) / 어깨 너비. 거북목이면 값이 줄어든다.
export const DEFAULT_BASELINE = 0.6;
const DROP_BAD = 0.15; // 기준 대비 15% 이상 감소 → 나쁨
const DROP_FULL = 0.3; // 30% 감소 → 거북이 100%
const TILT_BAD = 0.12; // 어깨 기울기 한계

export interface PostureResult {
  ratio: number;
  tilt: number;
  turtlePct: number;
  bad: boolean;
}

const seen = (p?: Landmark): p is Landmark =>
  !!p && (p.visibility ?? 0) >= MIN_VISIBILITY;

export function measure(lm: Landmark[]): { ratio: number; tilt: number } | null {
  const ls = lm[11];
  const rs = lm[12];
  if (!seen(ls) || !seen(rs)) return null;
  const width = Math.hypot(ls.x - rs.x, ls.y - rs.y);
  if (width < 0.05) return null;
  const ears = [lm[7], lm[8]].filter(seen);
  if (ears.length === 0) return null;
  const earY = ears.reduce((s, p) => s + p.y, 0) / ears.length;
  const shoulderY = (ls.y + rs.y) / 2;
  return {
    ratio: (shoulderY - earY) / width,
    tilt: Math.abs(ls.y - rs.y) / width,
  };
}

export function evaluatePosture(
  lm: Landmark[],
  baseline: number,
): PostureResult | null {
  const m = measure(lm);
  if (!m) return null;
  const drop = 1 - m.ratio / baseline;
  const turtlePct = Math.min(
    100,
    Math.round((Math.max(drop, 0) / DROP_FULL) * 100),
  );
  return {
    ratio: m.ratio,
    tilt: m.tilt,
    turtlePct,
    bad: drop >= DROP_BAD || m.tilt >= TILT_BAD,
  };
}

export function loadBaseline(): number {
  try {
    const n = Number(localStorage.getItem(BASELINE_KEY));
    return Number.isFinite(n) && n > 0.1 ? n : DEFAULT_BASELINE;
  } catch {
    return DEFAULT_BASELINE;
  }
}

export function saveBaseline(value: number): void {
  try {
    localStorage.setItem(BASELINE_KEY, String(value));
  } catch {
    /* 저장 실패는 무시 */
  }
}
