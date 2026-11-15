import { useState, type FormEvent } from 'react';
import './library.css';
import './library-panels.css';
import { LibraryPanel } from './LibraryReserve';
import { LibraryLab } from './LibraryLab';

const TABS = ['통합검색', '소장자료', '전자자료', '학위논문'] as const;

const QUICK = [
  { icon: '📚', title: '자료 검색', desc: '도서·논문·전자자료' },
  { icon: '💺', title: '열람실 좌석', desc: '실시간 현황·예약' },
  { icon: '📖', title: '내 서재', desc: '대출·반납·연장' },
  { icon: '💻', title: '전자도서관', desc: '전자책·학술DB' },
  { icon: '🚪', title: '스터디룸', desc: '그룹 학습 공간' },
  { icon: '📝', title: '희망도서', desc: '구입 신청' },
  { icon: '🔁', title: '상호대차', desc: '타 도서관 자료' },
  { icon: '❓', title: '이용안내', desc: '운영시간·FAQ' },
];

const ROOMS = [
  { name: '제1열람실', used: 82, total: 120 },
  { name: '제2열람실', used: 41, total: 96 },
  { name: '노트북실', used: 58, total: 64 },
  { name: '그룹스터디룸', used: 5, total: 12 },
];

const NOTICES = [
  { title: '기말고사 기간 열람실 24시간 운영 안내', date: '2026.11.12' },
  { title: '전자저널 접속 오류 복구 완료', date: '2026.11.10' },
  { title: '12월 휴관일 및 단축 운영 안내', date: '2026.11.07' },
  { title: '신규 구독 DB 이용 교육 신청', date: '2026.11.03' },
  { title: '연체 도서 반납 독려 기간 운영', date: '2026.10.28' },
];

const BOOKS = [
  { title: '인공지능 개론', author: '김민수', hue: 200 },
  { title: '선형대수학의 이해', author: '이서연', hue: 20 },
  { title: '자료구조와 알고리즘', author: '박지훈', hue: 140 },
  { title: '현대 물리학', author: '최유진', hue: 280 },
  { title: '데이터베이스 설계', author: '정하늘', hue: 340 },
  { title: '기계학습 실전', author: '한도윤', hue: 60 },
];

const MOCK_RESULTS = [
  { title: '인공지능: 현대적 접근', meta: '도서 · 중앙도서관 3층 · 대출가능' },
  { title: 'Deep Learning for Vision', meta: '전자책 · 온라인 이용' },
  { title: '컴퓨터 비전 기초', meta: '학위논문 · 2025' },
];

export function LibraryPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [q, setQ] = useState('');
  const [done, setDone] = useState('');
  const [panel, setPanel] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(q.trim());
  };

  return (
    <section className="library">
      <div className="lib-hero">
        <h1>술술 도서관</h1>
        <p>오늘 열람 시간 09:00 – 22:00 · 시험기간 24시간</p>
        <div className="lib-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              className={t === tab ? 'lib-tab lib-tab-on' : 'lib-tab'}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <form className="lib-search" onSubmit={submit}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`${tab} 검색어를 입력하세요`}
            aria-label="검색어"
          />
          <button type="submit" className="btn btn-primary">
            검색
          </button>
        </form>
      </div>

      {done && (
        <div className="lib-card lib-results">
          <h2>
            “{done}” {tab} 결과 (모의)
          </h2>
          <ul>
            {MOCK_RESULTS.map((r) => (
              <li key={r.title}>
                <strong>{r.title}</strong>
                <span>{r.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="library-links">
        {QUICK.map((l) => (
          <li key={l.title}>
            <a
              href="#"
              className="library-link"
              onClick={(e) => {
                e.preventDefault();
                setPanel(l.title === panel ? null : l.title);
              }}
            >
              <span className="lib-icon" aria-hidden>
                {l.icon}
              </span>
              <strong>{l.title}</strong>
              <span>{l.desc}</span>
            </a>
          </li>
        ))}
      </ul>
      {panel && <LibraryPanel kind={panel} onClose={() => setPanel(null)} />}

      <div className="lib-cols">
        <div className="lib-card">
          <h2>공지사항</h2>
          <ul className="lib-notices">
            {NOTICES.map((n) => (
              <li key={n.title}>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  {n.title}
                </a>
                <time>{n.date}</time>
              </li>
            ))}
          </ul>
        </div>

        <div className="lib-card">
          <h2>열람실 현황</h2>
          <ul className="lib-rooms">
            {ROOMS.map((r) => {
              const pct = Math.round((r.used / r.total) * 100);
              return (
                <li key={r.name}>
                  <div className="lib-room-head">
                    <span>{r.name}</span>
                    <span className="muted">
                      {r.used}/{r.total}
                    </span>
                  </div>
                  <div
                    className="lib-bar"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={pct >= 90 ? 'lib-bar-fill lib-full' : 'lib-bar-fill'}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="lib-card">
        <h2>신착 도서</h2>
        <ul className="lib-books">
          {BOOKS.map((b) => (
            <li key={b.title}>
              <div
                className="lib-cover"
                style={{ background: `hsl(${b.hue} 45% 40%)` }}
                aria-hidden
              >
                {b.title.slice(0, 2)}
              </div>
              <strong>{b.title}</strong>
              <span className="muted">{b.author}</span>
            </li>
          ))}
        </ul>
      </div>

      <LibraryLab />

      <footer className="lib-footer muted">
        술술 도서관 · 모의 사이트 (시연용) · 문의 000-0000-0000
      </footer>
    </section>
  );
}
