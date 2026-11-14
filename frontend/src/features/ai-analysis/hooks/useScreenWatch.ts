import { useCallback, useEffect, useRef, useState } from 'react';
import { studyApi, type ScreenCheck } from '../../../api/study';
import { errorText } from '../../../components/format';
import { notifyDesktop } from '../lib/notify';
import { openScreen, type ScreenSession } from '../services/screenCaptureService';

const CAPTURE_MS = 30_000; // 캡처 간격
const TOAST_COOLDOWN_MS = 60_000;
const TOAST_MS = 8_000;

export function useScreenWatch() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [last, setLast] = useState<ScreenCheck | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const aliveRef = useRef(true);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setActive(false);
    setLast(null);
  }, []);

  const start = useCallback(async () => {
    if (stopRef.current) return;
    setError(null);

    let session: ScreenSession;
    try {
      session = await openScreen();
    } catch (e) {
      setError(errorText(e));
      return;
    }
    if (!aliveRef.current) {
      session.close();
      return;
    }

    let busy = false;
    let closed = false;
    let lastToast = 0;

    const tick = async () => {
      if (busy || closed) return;
      busy = true;
      try {
        const image = session.capture();
        if (!image) return;
        const res = await studyApi.screenCheck(image);
        if (closed) return;
        setLast(res);
        const now = Date.now();
        if (res.distracted && res.message && now - lastToast >= TOAST_COOLDOWN_MS) {
          lastToast = now;
          setToast(res.message);
          notifyDesktop('딴짓 감지', res.message);
        }
      } catch (e) {
        if (!closed) setError(errorText(e));
      } finally {
        busy = false;
      }
    };

    const timer = setInterval(() => void tick(), CAPTURE_MS);
    stopRef.current = () => {
      closed = true;
      clearInterval(timer);
      session.close();
    };
    // 브라우저의 "공유 중지" 버튼
    session.onEnded(stop);
    setActive(true);
    void tick();
  }, [stop]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const dismiss = useCallback(() => setToast(null), []);

  return { active, error, toast, last, start, stop, dismiss };
}
