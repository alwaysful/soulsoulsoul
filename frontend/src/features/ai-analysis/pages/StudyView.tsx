import { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { OverlayCanvas } from '../components/OverlayCanvas';
import { PostureToast } from '../components/PostureToast';
import { QuitBanner } from '../components/QuitBanner';
import { SleepGauge } from '../components/SleepGauge';
import { useAnalysis } from '../hooks/useAnalysis';
import { useCoach } from '../hooks/useCoach';
import { useQuitGuard } from '../hooks/useQuitGuard';
import { useScreenWatch } from '../hooks/useScreenWatch';
import { useSleep } from '../hooks/useSleepGauge';
import { pickPhoneMessage, pickSlackMessage, pickSleepStart } from '../lib/hints';
import { pickTurtleMessage } from '../lib/messages';
import { requestDesktopPermission } from '../lib/notify';
import { pickQuitMessage } from '../lib/quitMessages';
import { sleepScore } from '../lib/sleep';
import '../analysis.css';
import '../study.css';
import '../study-analysis.css';

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

// 지수(%)가 limit 이상이면 점이 빨강
const CHIPS = [
  { key: 'posture', label: '자세', limit: 40 },
  { key: 'phone', label: '핸드폰', limit: 15 },
  { key: 'slack', label: '딴짓', limit: 35 },
  { key: 'sleep', label: '수면', limit: 30 },
] as const;

const DEVICE_KEY = 'pushDeviceId';

function loadDeviceId(): string {
  try {
    return localStorage.getItem(DEVICE_KEY) ?? '';
  } catch {
    return '';
  }
}

function hms(ms: number): string {
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export function StudyPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, error, frame, start, stop } = useAnalysis(videoRef);
  const [view, setView] = useState<'user' | 'analysis'>('user');
  const [deviceId, setDeviceId] = useState(loadDeviceId);
  const [calibration, setCalibration] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [roasts, setRoasts] = useState(0);
  const [recent, setRecent] = useState('');
  const coach = useCoach(frame, deviceId.trim());
  const sleep = useSleep(frame, deviceId.trim());
  const screen = useScreenWatch();
  const running = status === 'running';
  const quit = useQuitGuard();
  const busy = running || screen.active;

  const values: Record<(typeof CHIPS)[number]['key'], number> = {
    posture: coach.posture?.turtlePct ?? 0,
    phone: Math.round(
      Math.max(0, ...(frame?.objects.map((o) => o.score) ?? [])) * 100,
    ),
    slack: screen.last?.distractPct ?? 0,
    sleep: frame ? sleepScore(frame) : 0,
  };

  // 조건을 어겼을 때 나오는 메시지 미리보기
  const hints = [
    { label: '자세 불량', get: () => pickTurtleMessage(coach.posture?.turtlePct ?? 0) },
    { label: '스마트폰 사용', get: pickPhoneMessage },
    { label: '딴짓', get: pickSlackMessage },
    { label: '수면', get: pickSleepStart },
    { label: '종료 시도', get: () => pickQuitMessage(Math.floor(Math.random() * 4)) },
  ];

  useEffect(() => {
    if (!busy) quit.reset();
  }, [busy, quit.reset]);

  useEffect(() => {
    if (!busy) {
      setElapsed(0);
      return;
    }
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - t0), 1000);
    return () => clearInterval(id);
  }, [busy]);

  // 꼽 받은 횟수 / 최근 꼽
  useEffect(() => {
    if (!coach.toast) return;
    setRoasts((n) => n + 1);
    setRecent(coach.toast);
  }, [coach.toast]);
  useEffect(() => {
    if (!sleep.toast) return;
    setRoasts((n) => n + 1);
    setRecent(sleep.toast);
  }, [sleep.toast]);
  useEffect(() => {
    if (!screen.toast) return;
    setRoasts((n) => n + 1);
    setRecent(screen.toast);
  }, [screen.toast]);

  // 공부 중 탭 닫기도 한 번 막는다
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);

  // 화면 공유 팝업은 클릭 직후 호출해야 한다
  const handleStart = () => {
    void requestDesktopPermission();
    void screen.start();
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
      <PostureToast
        message={preview ?? quit.toast ?? coach.toast ?? sleep.toast ?? screen.toast}
        onClose={() => {
          setPreview(null);
          coach.dismiss();
          sleep.dismiss();
          screen.dismiss();
          quit.dismiss();
        }}
      />

      <div className={view === 'analysis' ? 'analysis-layout' : undefined}>
        {/* 영상은 항상 마운트. 사용자 화면에서는 화면 밖으로 치운다 */}
        <div
          className={
            view === 'analysis' ? 'analysis-stage' : 'analysis-stage study-hidden'
          }
        >
          <video ref={videoRef} className="analysis-video" muted playsInline />
          <OverlayCanvas frame={frame} video={videoRef.current} />
        </div>

        {view === 'user' ? (
          <div className="study">
            <span className={busy ? 'study-pill on' : 'study-pill'}>
              <i className="study-dot" />
              {busy ? '감시 중' : '감시 꺼짐'}
            </span>
            {busy ? (
              <>
                <div className="study-time">{hms(elapsed)}</div>
                <p className="study-sub">
                  오늘 꼽 먹은 횟수 {roasts}회{recent && ` · 최근: ${recent}`}
                </p>
                <button
                  type="button"
                  className="study-main stop"
                  onClick={quit.request}
                >
                  감시 종료
                </button>
              </>
            ) : (
              <>
                <h2>공부 시작할까요?</h2>
                <p className="study-sub">
                  시작하면 웹캠과 화면을 확인하고, 딴짓하면 꼽줍니다.
                </p>
                <button
                  type="button"
                  className="study-main"
                  disabled={status === 'loading'}
                  onClick={handleStart}
                >
                  {status === 'loading' ? '준비 중' : '감시 시작'}
                </button>
              </>
            )}
            <SleepGauge progress={sleep.progress} sleeping={sleep.sleeping} />
            <div className="study-chips">
              {CHIPS.map((c) => (
                <span
                  key={c.key}
                  className={values[c.key] >= c.limit ? 'study-chip hot' : 'study-chip'}
                  title={`${values[c.key]}% (기준 ${c.limit}%)`}
                >
                  <i />
                  {c.label}
                </span>
              ))}
            </div>
            <ErrorMessage message={error} />
            <ErrorMessage message={coach.pushError} />
            <ErrorMessage message={sleep.error} />
            <ErrorMessage message={screen.error} />
            <button
              type="button"
              className="study-link"
              onClick={() => setView('analysis')}
            >
              분석하기
            </button>
          </div>
        ) : (
          <>
            <div className="analysis-left">
              <ErrorMessage message={error} />
              <div className="row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={status === 'loading' || running}
                  onClick={() => {
                    void requestDesktopPermission();
                    void start();
                  }}
                >
                  {status === 'loading' ? '준비 중' : '시작'}
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!busy}
                  onClick={quit.request}
                >
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
                <button type="button" className="btn btn-ghost" onClick={() => setView('user')}>
                  돌아가기
                </button>
                {calibration && <span className="muted">{calibration}</span>}
              </div>
              <div className="analysis-hints">
                <h2>어겼을 때 메시지</h2>
                <div className="row">
                  {hints.map((h) => (
                    <button
                      key={h.label}
                      type="button"
                      className="btn"
                      onClick={() => setPreview(h.get())}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form">
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
            </div>

            <aside className="analysis-right">
              <h2>분석 결과</h2>
              <SleepGauge progress={sleep.progress} sleeping={sleep.sleeping} />
              {screen.active && (
                <div className="analysis-screen">
                  <p>
                    딴짓 확률:{' '}
                    <strong>
                      {screen.last ? `${screen.last.distractPct}%` : '분석 중'}
                    </strong>
                  </p>
                  <p>화면 요약: {screen.last?.summary || '-'}</p>
                </div>
              )}
              {frame ? (
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
                    {coach.pushedAt
                      ? new Date(coach.pushedAt).toLocaleTimeString('ko-KR')
                      : '-'}
                  </li>
                  <li>수면: {sleep.sleeping ? '수면 중' : '깨어 있음'}</li>
                  <li>
                    화면:{' '}
                    {screen.active ? (screen.last?.activity ?? '분석 대기') : '꺼짐'}
                  </li>
                </ul>
              ) : (
                <p className="muted">분석 시작 전</p>
              )}
            </aside>
          </>
        )}
      </div>
    </section>
  );
}
