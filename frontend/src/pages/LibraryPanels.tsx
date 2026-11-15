import { useState, type FormEvent } from 'react';

interface Props {
  kind: string;
  onClose: () => void;
}

const ROOMS = [
  { name: '제1열람실', total: 120, used: 82 },
  { name: '제2열람실', total: 96, used: 41 },
  { name: '노트북실', total: 64, used: 58 },
  { name: '그룹스터디룸', total: 12, used: 5 },
];

const DAY = 86_400_000;
const fmt = (t: number) => new Date(t).toLocaleDateString('ko-KR');

function Seats() {
  const [ri, setRi] = useState(0);
  const [mine, setMine] = useState<{ room: number; seat: number } | null>(null);
  const r = ROOMS[ri];
  const taken = (i: number) => (i * 17 + r.name.length) % r.total < r.used;
  const here = mine?.room === ri ? mine.seat : -1;
  return (
    <>
      <div className="lp-tabs">
        {ROOMS.map((x, i) => (
          <button
            key={x.name}
            type="button"
            className={i === ri ? 'chip chip-active' : 'chip'}
            onClick={() => setRi(i)}
          >
            {x.name}
          </button>
        ))}
      </div>
      <p className="muted">
        {mine
          ? `내 좌석: ${ROOMS[mine.room].name} ${mine.seat + 1}번`
          : '좌석을 눌러 예약하세요.'}
        {mine && (
          <button type="button" className="btn btn-ghost" onClick={() => setMine(null)}>
            예약 취소
          </button>
        )}
      </p>
      <div className="lp-seats">
        {Array.from({ length: r.total }, (_, i) => {
          const cls =
            i === here ? 'lp-seat lp-mine' : taken(i) ? 'lp-seat lp-taken' : 'lp-seat';
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={taken(i) && i !== here}
              onClick={() => setMine({ room: ri, seat: i })}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Loans() {
  const [rows, setRows] = useState(() => [
    { id: 1, title: '인공지능: 현대적 접근', due: Date.now() + 3 * DAY, renewed: false },
    { id: 2, title: '자료구조와 알고리즘', due: Date.now() + 9 * DAY, renewed: false },
    { id: 3, title: '선형대수학의 이해', due: Date.now() - 2 * DAY, renewed: true },
  ]);
  if (rows.length === 0) return <p className="empty">대출 중인 자료가 없습니다.</p>;
  return (
    <ul className="lp-list">
      {rows.map((b) => {
        const late = b.due < Date.now();
        return (
          <li key={b.id}>
            <div>
              <strong>{b.title}</strong>
              <span className={late ? 'lp-late' : 'muted'}>
                반납예정 {fmt(b.due)}
                {late && ' (연체)'}
              </span>
            </div>
            <div className="row">
              <button
                type="button"
                className="btn"
                disabled={b.renewed || late}
                onClick={() =>
                  setRows(
                    rows.map((x) =>
                      x.id === b.id ? { ...x, due: x.due + 7 * DAY, renewed: true } : x,
                    ),
                  )
                }
              >
                {b.renewed ? '연장됨' : '7일 연장'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setRows(rows.filter((x) => x.id !== b.id))}
              >
                반납
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const SLOTS = ['09', '10', '11', '12', '13', '14', '15', '16', '17'];
const SROOMS = ['스터디룸 A', '스터디룸 B', '스터디룸 C'];
const PRE = new Set(['스터디룸 A-10', '스터디룸 A-11', '스터디룸 B-14', '스터디룸 C-09']);

function StudyRooms() {
  const [mine, setMine] = useState<Set<string>>(new Set());
  const toggle = (k: string) => {
    const n = new Set(mine);
    if (!n.delete(k)) n.add(k);
    setMine(n);
  };
  return (
    <div className="lp-scroll">
      <table className="lp-table">
        <thead>
          <tr>
            <th />
            {SLOTS.map((s) => (
              <th key={s}>{s}시</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SROOMS.map((r) => (
            <tr key={r}>
              <th>{r}</th>
              {SLOTS.map((s) => {
                const k = `${r}-${s}`;
                const on = mine.has(k);
                return (
                  <td key={s}>
                    <button
                      type="button"
                      className={on ? 'lp-cell lp-mine' : 'lp-cell'}
                      disabled={PRE.has(k)}
                      onClick={() => toggle(k)}
                    >
                      {PRE.has(k) ? '마감' : on ? '예약' : '가능'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Request({ label, extra }: { label: string; extra?: string[] }) {
  const [title, setTitle] = useState('');
  const [opt, setOpt] = useState(extra?.[0] ?? '');
  const [items, setItems] = useState<string[]>([]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setItems([`${t}${opt ? ` · ${opt}` : ''}`, ...items]);
    setTitle('');
  };
  return (
    <>
      <form className="lp-form" onSubmit={submit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="도서명"
          aria-label="도서명"
        />
        {extra && (
          <select value={opt} onChange={(e) => setOpt(e.target.value)} aria-label="도서관">
            {extra.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        )}
        <button type="submit" className="btn btn-primary">
          {label}
        </button>
      </form>
      <ul className="lp-list">
        {items.map((x, i) => (
          <li key={i}>
            <span>{x}</span>
            <span className="muted">접수됨</span>
          </li>
        ))}
      </ul>
    </>
  );
}

const FAQ = [
  ['열람 시간은?', '평일 09:00–22:00, 시험기간 24시간 운영합니다.'],
  ['대출 권수와 기간은?', '학부생 10권 14일, 대학원생 20권 30일입니다.'],
  ['좌석 예약은 얼마나 유지되나요?', '예약 후 30분 안에 입실하지 않으면 자동 취소됩니다.'],
  ['연체하면 어떻게 되나요?', '연체 1일당 1일 대출이 정지됩니다.'],
];
const EDB = ['Web of Science', 'IEEE Xplore', 'ScienceDirect', 'RISS', 'DBpia', 'Springer eBooks'];

function Info() {
  return (
    <div className="lp-faq">
      {FAQ.map(([q, a]) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}

function Edb() {
  return (
    <ul className="lp-chips">
      {EDB.map((d) => (
        <li key={d} className="chip">
          {d}
        </li>
      ))}
    </ul>
  );
}

function Body({ kind }: { kind: string }) {
  switch (kind) {
    case '열람실 좌석':
      return <Seats />;
    case '내 서재':
      return <Loans />;
    case '스터디룸':
      return <StudyRooms />;
    case '희망도서':
      return <Request label="신청" />;
    case '상호대차':
      return (
        <Request
          label="신청"
          extra={['서울대 도서관', '연세대 도서관', 'KAIST 도서관', '고려대 도서관']}
        />
      );
    case '이용안내':
      return <Info />;
    case '전자도서관':
      return <Edb />;
    default:
      return <p className="muted">위 검색창에서 검색하세요.</p>;
  }
}

export function LibraryPanel({ kind, onClose }: Props) {
  return (
    <div className="lib-card lp">
      <div className="row between">
        <h2>{kind}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          닫기
        </button>
      </div>
      <Body kind={kind} />
    </div>
  );
}
