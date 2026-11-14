import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../../../api/notifications';
import { sleepApi } from '../../../api/sleep';
import { errorText } from '../../../components/format';
import { notifyDesktop } from '../lib/notify';
import { formatDuration, isSleepy } from '../lib/sleep';
import type { AnalysisFrame } from '../types';

const SLEEP_MS = 120_000; // 이 시간 이상 졸음 상태면 수면으로 판정
const WAKE_GRACE_MS = 15_000; // 이 시간 이상 깨어 있으면 기상으로 판정 (눈 깜빡임 흡수)
const TOAST_MS = 8_000;
const START_MESSAGES = [
  '잘 자요. 공부는 제가 대신 못 합니다.',
  '도서관을 숙박시설로 이용해 주셔서 감사합니다.',
  '오늘의 학습 성과: 렘수면 진입 성공.',
];

export function useSleep(frame: AnalysisFrame | null, deviceId: string) {
  const [sleeping, setSleeping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const since = useRef<number | null>(null); // 졸음 시작 추정 시각
  const last = useRef(0); // 마지막으로 졸음이 관측된 시각
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
    // 분석 중지: 수면 중이었다면 마지막 관측 시각으로 종료 처리
    if (!frame) {
      if (active.current && since.current !== null) {
        finish(since.current, last.current);
      }
      since.current = null;
      active.current = false;
      return;
    }

    const now = Date.now();
    if (isSleepy(frame)) {
      since.current ??= now;
      last.current = now;
      if (!active.current && now - since.current >= SLEEP_MS) {
        active.current = true;
        setSleeping(true);
        const msg = START_MESSAGES[Math.floor(Math.random() * START_MESSAGES.length)];
        setToast(msg);
        notifyDesktop('수면 감지', msg);
        push('sleep-start');
      }
    } else if (since.current !== null && now - last.current > WAKE_GRACE_MS) {
      if (active.current) finish(since.current, last.current);
      since.current = null;
      active.current = false;
    }
  }, [frame, finish, push]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const dismiss = useCallback(() => setToast(null), []);

  return { sleeping, toast, error, dismiss };
}
