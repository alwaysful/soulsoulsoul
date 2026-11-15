import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../../../api/notifications';
import { sleepApi } from '../../../api/sleep';
import { errorText } from '../../../components/format';
import { pickSleepStart } from '../lib/hints';
import { notifyDesktop } from '../lib/notify';
import { PRONE_MS, isProne } from '../lib/prone';
import { formatDuration } from '../lib/sleep';
import type { AnalysisFrame } from '../types';

const WAKE_GRACE_MS = 5_000; // 이 시간 이상 안 엎드려 있으면 기상/게이지 초기화

// 엎드림이 PRONE_MS 지속되면 수면. progress 는 0~1 게이지 값.
export function useSleep(frame: AnalysisFrame | null, deviceId: string) {
  const [sleeping, setSleeping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const since = useRef<number | null>(null); // 엎드림 시작 시각
  const last = useRef(0); // 마지막으로 엎드림이 관측된 시각
  const active = useRef(false);
  const device = useRef(deviceId);
  device.current = deviceId;

  const push = useCallback((kind: 'sleep-start' | 'sleep-end', sec?: number) => {
    if (!device.current) return;
    notificationApi
      .phoneAlert(device.current, kind, sec)
      .catch((e: unknown) => setError(errorText(e)));
  }, []);

  const finish = useCallback(
    (startedAt: number, endedAt: number) => {
      active.current = false;
      setSleeping(false);
      const sec = Math.max(1, Math.round((endedAt - startedAt) / 1000));
      const msg = `좋은 꿈 꾸셨나요? 회원님이 공부 중 실종된 시간: ${formatDuration(sec)}`;
      setToast(msg);
      notifyDesktop('수면 종료', msg);
      push('sleep-end', sec);
      sleepApi
        .create({
          startedAt: new Date(startedAt).toISOString(),
          endedAt: new Date(endedAt).toISOString(),
        })
        .catch((e: unknown) => setError(errorText(e)));
    },
    [push],
  );

  useEffect(() => {
    if (!frame) {
      if (active.current && since.current !== null) {
        finish(since.current, last.current);
      }
      since.current = null;
      active.current = false;
      setProgress(0);
      return;
    }

    const now = Date.now();
    if (isProne(frame)) {
      since.current ??= now;
      last.current = now;
      const p = Math.min(1, (now - since.current) / PRONE_MS);
      setProgress(Math.round(p * 100) / 100);
      if (!active.current && p >= 1) {
        active.current = true;
        setSleeping(true);
        const msg = pickSleepStart();
        setToast(msg);
        notifyDesktop('수면 감지', msg);
        push('sleep-start');
      }
    } else if (since.current !== null && now - last.current > WAKE_GRACE_MS) {
      if (active.current) finish(since.current, last.current);
      since.current = null;
      active.current = false;
      setProgress(0);
    }
  }, [frame, finish, push]);

  const dismiss = useCallback(() => setToast(null), []);

  return { sleeping, progress, toast, error, dismiss };
}
