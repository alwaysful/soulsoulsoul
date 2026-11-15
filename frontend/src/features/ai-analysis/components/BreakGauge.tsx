import { BREAK_MINUTES } from '../hooks/useBreak';
import '../break.css';

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

interface GaugeProps {
  remainingMs: number;
  totalMs: number;
}

// 남은 휴식 시간 게이지 (휴식 중일 때만 표시)
export function BreakGauge({ remainingMs, totalMs }: GaugeProps) {
  if (totalMs <= 0) return null;
  const pct = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));
  return (
    <div
      className="break-gauge"
      role="progressbar"
      aria-label="남은 휴식 시간"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div className="break-gauge-fill" style={{ width: `${pct}%` }} />
      <span>휴식 {mmss(remainingMs)}</span>
    </div>
  );
}

export function BreakButtons({ onStart }: { onStart: (minutes: number) => void }) {
  return (
    <div className="break-buttons">
      {BREAK_MINUTES.map((m) => (
        <button
          key={m}
          type="button"
          className="break-btn"
          onClick={() => onStart(m)}
        >
          {m}분 휴식
        </button>
      ))}
    </div>
  );
}
