import { useCallback, useEffect, useRef, useState } from 'react';
import { notifyDesktop } from '../lib/notify';
import { QUIT_DONE, QUIT_PROMPT, pickQuitMessage } from '../lib/quitMessages';

export const QUIT_TOTAL_MS = 5 * 60_000;
// 단계별 알림 간격: 갈수록 잦아진다
const INTERVALS_MS = [60_000, 40_000, 20_000, 10_000];

export type QuitPhase = 'idle' | 'counting' | 'ready';

export function useQuitGuard() {
  const [phase, setPhase] = useState<QuitPhase>('idle');
  const [remainingMs, setRemainingMs] = useState(QUIT_TOTAL_MS);
  const endAt = useRef(0);
  const nextAlarm = useRef(0);

  const request = useCallback(() => {
    if (phase !== 'idle') return;
    const now = Date.now();
    endAt.current = now + QUIT_TOTAL_MS;
    nextAlarm.current = now + INTERVALS_MS[0];
    setRemainingMs(QUIT_TOTAL_MS);
    setPhase('counting');
    notifyDesktop('종료 보류', QUIT_PROMPT);
  }, [phase]);

  const reset = useCallback(() => {
    setPhase('idle');
  }, []);

  useEffect(() => {
    if (phase !== 'counting') return;
    const id = setInterval(() => {
      const now = Date.now();
      const left = endAt.current - now;
      if (left <= 0) {
        setRemainingMs(0);
        setPhase('ready');
        notifyDesktop('종료 가능', QUIT_DONE);
        return;
      }
      setRemainingMs(left);
      if (now >= nextAlarm.current) {
        const level = Math.min(
          INTERVALS_MS.length - 1,
          Math.floor((1 - left / QUIT_TOTAL_MS) * INTERVALS_MS.length),
        );
        const msg = pickQuitMessage(level);
        notifyDesktop('종료 보류', msg);
        nextAlarm.current = now + INTERVALS_MS[level];
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  return { phase, remainingMs, request, reset };
}
