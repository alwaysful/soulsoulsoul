import { useRef } from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { OverlayCanvas } from '../components/OverlayCanvas';
import { useAnalysis } from '../hooks/useAnalysis';
import '../analysis.css';

const JOINTS: Record<number, string> = {
  0: '코',
  11: '왼쪽 어깨',
  12: '오른쪽 어깨',
  13: '왼쪽 팔꿈치',
  14: '오른쪽 팔꿈치',
  15: '왼쪽 손목',
  16: '오른쪽 손목',
};

export function AnalysisPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { status, error, frame, start, stop } = useAnalysis(videoRef);
  const running = status === 'running';

  return (
    <section>
      <h1>자세 · 스마트폰 분석</h1>
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
          onClick={() => void start()}
        >
          {status === 'loading' ? '준비 중' : '시작'}
        </button>
        <button type="button" className="btn" disabled={!running} onClick={stop}>
          중지
        </button>
      </div>
      {frame && (
        <ul className="analysis-list">
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
        </ul>
      )}
    </section>
  );
}
