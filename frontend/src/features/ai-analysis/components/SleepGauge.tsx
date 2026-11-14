import { PRONE_MS } from '../lib/prone';

interface Props {
  progress: number; // 0~1
  sleeping: boolean;
}

export function SleepGauge({ progress, sleeping }: Props) {
  if (progress <= 0 && !sleeping) return null;
  const total = PRONE_MS / 1000;
  const sec = Math.min(total, Math.floor(progress * total));
  return (
    <div
      className="sleep-gauge"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div className="sleep-gauge-fill" style={{ width: `${progress * 100}%` }} />
      <span>{sleeping ? '수면 판정' : `엎드림 ${sec}/${total}초`}</span>
    </div>
  );
}
