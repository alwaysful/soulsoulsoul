import { useCallback, useEffect, useRef, useState } from 'react';
import { notifyDesktop } from '../lib/notify';

export const BREAK_MINUTES = [3, 5, 10] as const;
const BREAK_DONE = '휴식 끝. 다시 공부하세요.';
// 마지막 휴식 종료 후 이 시간 안에 또 쉬면 꼽을 준다
const REST_COOLDOWN_MS = 30 * 60_000;
const TOO_SOON = [
  '공부시간보다 휴식시간이 더 긴데요??',
  '방금 쉬셨는데요. 엉덩이에 접착제 바르시죠.',
  '휴식 중독이십니까? 아직 30분도 안 지났습니다.',
];

export function useBreak() {
  const [totalMs, setTotalMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const endAt = useRef(0);
  const lastEnd = useRef(0);
  const running = useRef(false);

  const start = useCallback((minutes: number) => {
    const ms = minutes * 60_000;
    const now = Date.now();
    if (lastEnd.current && now - lastEnd.current < REST_COOLDOWN_MS) {
      const msg = TOO_SOON[Math.floor(Math.random() * TOO_SOON.length)];
      notifyDesktop('휴식 과다', msg);
    }
    running.current = true;
    endAt.current = now + ms;
    setTotalMs(ms);
    setRemainingMs(ms);
  }, []);

  // 즉시 종료 (알림 없음)
  const end = useCallback(() => {
    if (running.current) {
      running.current = false;
      lastEnd.current = Date.now();
    }
    setTotalMs(0);
    setRemainingMs(0);
  }, []);

  useEffect(() => {
    if (totalMs === 0) return;
    const id = setInterval(() => {
      const left = endAt.current - Date.now();
      if (left <= 0) {
        running.current = false;
        lastEnd.current = Date.now();
        setTotalMs(0);
        setRemainingMs(0);
        notifyDesktop('휴식 종료', BREAK_DONE);
        return;
      }
      setRemainingMs(left);
    }, 500);
    return () => clearInterval(id);
  }, [totalMs]);

  return {
    active: totalMs > 0,
    totalMs,
    remainingMs,
    start,
    end,
  };
}
