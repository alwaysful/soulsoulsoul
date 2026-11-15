import { useCallback, useEffect, useRef, useState } from 'react';
import { notifyDesktop } from '../lib/notify';

export const BREAK_MINUTES = [3, 5, 10] as const;
const BREAK_DONE = '휴식 끝. 다시 공부하세요.';

export function useBreak() {
  const [totalMs, setTotalMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const endAt = useRef(0);

  const start = useCallback((minutes: number) => {
    const ms = minutes * 60_000;
    endAt.current = Date.now() + ms;
    setToast(null);
    setTotalMs(ms);
    setRemainingMs(ms);
  }, []);

  // 즉시 종료 (알림 없음)
  const end = useCallback(() => {
    setTotalMs(0);
    setRemainingMs(0);
  }, []);

  useEffect(() => {
    if (totalMs === 0) return;
    const id = setInterval(() => {
      const left = endAt.current - Date.now();
      if (left <= 0) {
        setTotalMs(0);
        setRemainingMs(0);
        setToast(BREAK_DONE);
        notifyDesktop('휴식 종료', BREAK_DONE);
        return;
      }
      setRemainingMs(left);
    }, 500);
    return () => clearInterval(id);
  }, [totalMs]);

  const dismiss = useCallback(() => setToast(null), []);

  return {
    active: totalMs > 0,
    totalMs,
    remainingMs,
    toast,
    start,
    end,
    dismiss,
  };
}
