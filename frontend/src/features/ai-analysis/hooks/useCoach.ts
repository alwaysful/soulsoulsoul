import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notificationApi } from '../../../api/notifications';
import { errorText } from '../../../components/format';
import { pickTurtleMessage } from '../lib/messages';
import {
  evaluatePosture,
  loadBaseline,
  saveBaseline,
} from '../lib/posture';
import type { AnalysisFrame } from '../types';

const BAD_MS = 10_000; // 나쁜 자세 유지 시간
const PHONE_MS = 10_000; // 스마트폰 사용 유지 시간
const PHONE_SCORE = 0.4; // 푸시 발송 기준 (표시 기준 15% 와 별개)
const GRACE_MS = 2_000; // 감지 끊김 허용 시간
const TOAST_COOLDOWN_MS = 60_000;
const PUSH_COOLDOWN_MS = 120_000;
const TOAST_MS = 6_000;

interface Hold {
  since: number | null;
  last: number;
}

// 조건이 유지된 시간(ms)을 돌려준다. 잠깐 끊겨도 GRACE_MS 안이면 유지로 본다.
function hold(h: Hold, active: boolean, now: number): number {
  if (active) {
    h.since ??= now;
    h.last = now;
  } else if (now - h.last > GRACE_MS) {
    h.since = null;
  }
  return h.since === null ? 0 : now - h.since;
}

export function useCoach(frame: AnalysisFrame | null, deviceId: string) {
  const [baseline, setBaseline] = useState(loadBaseline);
  const [toast, setToast] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushedAt, setPushedAt] = useState<number | null>(null);

  const bad = useRef<Hold>({ since: null, last: 0 });
  const phone = useRef<Hold>({ since: null, last: 0 });
  const lastToast = useRef(0);
  const lastPush = useRef(0);
  const ratio = useRef<number | null>(null);
  const device = useRef(deviceId);
  device.current = deviceId;

  const posture = useMemo(
    () => (frame?.pose ? evaluatePosture(frame.pose.landmarks, baseline) : null),
    [frame, baseline],
  );

  useEffect(() => {
    if (!frame) {
      bad.current = { since: null, last: 0 };
      phone.current = { since: null, last: 0 };
      ratio.current = null;
      return;
    }
    const now = Date.now();
    ratio.current = posture?.ratio ?? null;

    const badMs = hold(bad.current, !!posture?.bad, now);
    if (posture && badMs >= BAD_MS && now - lastToast.current >= TOAST_COOLDOWN_MS) {
      lastToast.current = now;
      setToast(pickTurtleMessage(posture.turtlePct));
    }

    const phoneMs = hold(
      phone.current,
      frame.objects.some((o) => o.score >= PHONE_SCORE),
      now,
    );
    if (
      phoneMs >= PHONE_MS &&
      device.current &&
      now - lastPush.current >= PUSH_COOLDOWN_MS
    ) {
      lastPush.current = now;
      notificationApi
        .phoneAlert(device.current)
        .then(() => {
          setPushedAt(now);
          setPushError(null);
        })
        .catch((e: unknown) => setPushError(errorText(e)));
    }
  }, [frame, posture]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const calibrate = useCallback((): boolean => {
    const r = ratio.current;
    if (r === null) return false;
    saveBaseline(r);
    setBaseline(r);
    return true;
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { posture, toast, dismiss, calibrate, pushError, pushedAt };
}
