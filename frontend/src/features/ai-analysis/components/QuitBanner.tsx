import type { QuitPhase } from '../hooks/useQuitGuard';
import { QUIT_PROMPT } from '../lib/quitMessages';
import '../quit.css';

interface Props {
  phase: QuitPhase;
  remainingMs: number;
  onCancel: () => void;
  onQuit: () => void;
}

function mmss(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function QuitBanner({ phase, remainingMs, onCancel, onQuit }: Props) {
  if (phase === 'idle') return null;
  const ready = phase === 'ready';
  return (
    <div className={ready ? 'quit-banner quit-banner-ready' : 'quit-banner'} role="status">
      <span>{ready ? '이제 종료할 수 있습니다.' : QUIT_PROMPT}</span>
      <strong className="quit-timer">{mmss(remainingMs)}</strong>
      <button type="button" className="btn" onClick={onCancel}>
        계속 공부
      </button>
      {ready && (
        <button type="button" className="btn btn-danger" onClick={onQuit}>
          종료
        </button>
      )}
    </div>
  );
}
