import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { errorText } from '../../../components/format';
import { createAnalysisService } from '../services/analysisService';
import { closeWebcam, openWebcam } from '../services/webcamService';
import type { AnalysisFrame, AnalysisService } from '../types';

export type AnalysisStatus = 'idle' | 'loading' | 'running' | 'error';

export function useAnalysis(videoRef: RefObject<HTMLVideoElement>) {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState<AnalysisFrame | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setFrame(null);
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    const video = videoRef.current;
    if (!video || stopRef.current) return;
    setStatus('loading');
    setError(null);

    let service: AnalysisService | null = null;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const cleanup = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      service?.close();
      closeWebcam(video, stream);
    };

    try {
      service = await createAnalysisService();
      stream = await openWebcam(video);
    } catch (e) {
      cleanup();
      setError(errorText(e));
      setStatus('error');
      return;
    }

    const svc = service;
    stopRef.current = cleanup;
    setStatus('running');
    const loop = () => {
      if (stopped) return;
      if (video.readyState >= 2) setFrame(svc.analyze(video, performance.now()));
      raf = requestAnimationFrame(loop);
    };
    loop();
  }, [videoRef]);

  useEffect(
    () => () => {
      stopRef.current?.();
      stopRef.current = null;
    },
    [],
  );

  return { status, error, frame, start, stop };
}
