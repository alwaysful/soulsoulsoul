import { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { OverlayCanvas } from '../components/OverlayCanvas';
import { PostureToast } from '../components/PostureToast';
import { QuitBanner } from '../components/QuitBanner';
import { useAnalysis } from '../hooks/useAnalysis';
import { useCoach } from '../hooks/useCoach';
import { useQuitGuard } from '../hooks/useQuitGuard';
import { useScreenWatch } from '../hooks/useScreenWatch';
import { useSleep } from '../hooks/useSleep';
import { requestDesktopPermission } from '../lib/notify';
import '../analysis.css';

const JOINTS: Record<number, string> = {
  0: '코',
  7: '왼쪽 귀',
  8: '오른쪽 귀',
  11: '왼쪽 어깨',
  12: '오른쪽 어깨',
  13: '왼쪽 팔꿈치',
  14: '오른쪽 팔꿈치',
  15: '왼쪽 손목',
  16: '오른쪽 손목',
};

const DEVICE_KEY = 'pushDeviceId';

function loadDeviceId(): string {
  try {
    return localStorage.getItem(DEVICE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function AnalysisPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, error, frame, start, stop } = useAnalysis(videoRef);
  const [deviceId, setDeviceId] = useState(loadDeviceId);
  const [calibration, setCalibration] = useState<string | null>(null);
  const coach = useCoach(frame, deviceId.trim());
  const sleep = useSleep(frame, deviceId.trim());
  const screen = useScreenWatch();
  const running = status === 'running';
  const quit = useQuitGuard();
  const busy = running || screen.active;

  useEffect(() => {
    if (!busy) quit.reset();
  }, [busy, quit.reset]);

  // 공부 중 탭 닫기도 한 번 막는다
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  const handleStart = () => {
    void requestDesktopPermission();
    void start();
  };

  const handleWatchNow = () => {
    if (screen.active) {
      screen.checkNow();
      return;
    }
    void requestDesktopPermission();
    void screen.start();
  };

  const confirmQuit = () => {
    stop();
    screen.stop();
    quit.reset();
  };

  const handleDeviceId = (value: string) => {
    setDeviceId(value);
    try {
      localStorage.setItem(DEVICE_KEY, value.trim());
    } catch {
      /* 저장 실패는 무시 */
    }
  };

  const handleCalibrate = () =>
    setCalibration(
      coach.calibrate() ? '기준 자세 저장함.' : '어깨와 귀가 안 보입니다.',
    );

  return (
    <section>
      <QuitBanner
        phase={quit.phase}
        remainingMs={quit.remainingMs}
        onCancel={quit.reset}
        onQuit={confirmQuit}
      />
      <h1>자세 · 스마트폰 분석</h1>
      <PostureToast
        message={quit.toast ?? coach.toast ?? sleep.toast ?? screen.toast}
        onClose={() => {
          coach.dismiss();
          sleep.dismiss();
          screen.dismiss();
          quit.dismiss();
        }}
      />
      <div className="analysis-stage">
        <video ref={videoRef} className="analysis-video" muted playsInline />
        <OverlayCanvas frame={frame} video={videoRef.current} />
      </div>
      <ErrorMessage message={error} />
      <div className="row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={status === 'loading' || running}
          onClick={handleStart}
        >
          {status === 'loading' ? '준비 중' : '시작'}
        </button>
        <button type="button" className="btn" disabled={!busy} onClick={quit.request}>
          종료
        </button>
        <button
          type="button"
          className="btn"
          disabled={!running}
          onClick={handleCalibrate}
        >
          바른 자세로 기준 저장
        </button>
        <button type="button" className="btn btn-primary" onClick={handleWatchNow}>
          당장 감시
        </button>
        {calibration && <span className="muted">{calibration}</span>}
      </div>
      <div className="form analysis-device">
        <label>
          스마트폰 기기 ID (푸시 알림용)
          <input
            type="text"
            value={deviceId}
            onChange={(e) => handleDeviceId(e.target.value)}
            placeholder="push device id"
          />
        </label>
      </div>
      <ErrorMessage message={coach.pushError} />
      <ErrorMessage message={sleep.error} />
      <ErrorMessage message={screen.error} />
      {screen.active && (
        <div className="analysis-screen">
          <p>
            딴짓 확률:{' '}
            <strong>{screen.last ? `${screen.last.distractPct}%` : '분석 중'}</strong>
          </p>
          <p>화면 요약: {screen.last?.summary || '-'}</p>
        </div>
      )}
      {frame && (
        <ul className="analysis-list">
          <li>
            거북이 지수:{' '}
            {coach.posture
              ? `${coach.posture.turtlePct}% (${coach.posture.bad ? '나쁨' : '좋음'})`
              : '-'}
          </li>
          {Object.entries(JOINTS).map(([i, name]) => {
            const p = frame.pose?.landmarks[Number(i)];
            return (
              <li key={i}>
                {name}:{' '}
                {p
                  ? `${p.x.toFixed(2)}, ${p.y.toFixed(2)} (가시성 ${(p.visibility ?? 0).toFixed(2)})`
                  : '-'}
              </li>
            );
          })}
          <li>
            스마트폰:{' '}
            {frame.objects.length
              ? frame.objects.map((o) => o.score.toFixed(2)).join(', ')
              : '없음'}
          </li>
          <li>
            마지막 푸시:{' '}
            {coach.pushedAt ? new Date(coach.pushedAt).toLocaleTimeString('ko-KR') : '-'}
          </li>
          <li>수면: {sleep.sleeping ? '수면 중' : '깨어 있음'}</li>
          <li>
            화면:{' '}
            {screen.active ? (screen.last?.activity ?? '분석 대기') : '꺼짐'}
          </li>
        </ul>
      )}
    </section>
  );
}
