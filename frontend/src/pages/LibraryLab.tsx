import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import './library-lab.css';

/* ---------- 공통 ---------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hash = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

/* ---------- 8. 책 배틀로얄 ---------- */
type Fighter = { title: string; diff: number; pages: number; infamy: number };

const PRESET: Fighter[] = [
  { title: '일반물리학', diff: 8, pages: 1200, infamy: 9 },
  { title: '미적분학', diff: 7, pages: 1100, infamy: 8 },
  { title: '일반화학', diff: 6, pages: 1050, infamy: 7 },
  { title: '선형대수학', diff: 7, pages: 600, infamy: 7 },
  { title: '유기화학', diff: 9, pages: 1300, infamy: 10 },
  { title: '전자기학', diff: 9, pages: 700, infamy: 9 },
  { title: '자료구조', diff: 6, pages: 550, infamy: 6 },
  { title: '양자역학', diff: 10, pages: 650, infamy: 10 },
  { title: '경제학원론', diff: 4, pages: 900, infamy: 5 },
  { title: '열역학', diff: 8, pages: 800, infamy: 8 },
];

const toFighter = (title: string): Fighter => {
  const h = hash(title);
  return { title, diff: 3 + (h % 8), pages: 200 + (h % 1200), infamy: 2 + ((h >> 3) % 9) };
};

const power = (f: Fighter) => f.diff * 4 + f.pages / 60 + f.infamy * 3 + Math.random() * 6;

const REASON = [
  (w: Fighter, l: Fighter) => `${w.pages}쪽의 두께로 《${l.title}》을(를) 깔아뭉갬`,
  (w: Fighter) => `난이도 ${w.diff}/10. 읽기만 해도 정신력 소모`,
  (w: Fighter) => `악명 ${w.infamy}/10. 재수강생들의 증언 다수`,
  (_w: Fighter, l: Fighter) => `《${l.title}》 연습문제가 해설 없이 무너짐`,
];

type Match = { a: Fighter; b: Fighter | null; win: Fighter; why: string };

function runBracket(list: Fighter[]): Match[][] {
  let alive = [...list].sort(() => Math.random() - 0.5);
  const rounds: Match[][] = [];
  while (alive.length > 1) {
    const r: Match[] = [];
    const next: Fighter[] = [];
    for (let i = 0; i < alive.length; i += 2) {
      const a = alive[i];
      const b = alive[i + 1] ?? null;
      if (!b) {
        r.push({ a, b, win: a, why: '상대 없음. 부전승' });
        next.push(a);
        continue;
      }
      const [w, l] = power(a) >= power(b) ? [a, b] : [b, a];
      r.push({ a, b, win: w, why: REASON[Math.floor(Math.random() * REASON.length)](w, l) });
      next.push(w);
    }
    rounds.push(r);
    alive = next;
  }
  return rounds;
}

const roundName = (n: number, total: number) => {
  const left = total - n;
  return left === 1 ? '결승전' : left === 2 ? '준결승' : `${2 ** left}강`;
};

function BookBattle() {
  const [picked, setPicked] = useState<Fighter[]>(PRESET.slice(0, 4));
  const [q, setQ] = useState('');
  const [rounds, setRounds] = useState<Match[][] | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (f: Fighter) => {
    setRounds(null);
    setPicked((p) =>
      p.some((x) => x.title === f.title)
        ? p.filter((x) => x.title !== f.title)
        : p.length >= 8
          ? p
          : [...p, f],
    );
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (!t || picked.some((x) => x.title === t) || picked.length >= 8) return;
    setPicked((p) => [...p, PRESET.find((x) => x.title === t) ?? toFighter(t)]);
    setQ('');
    setRounds(null);
  };

  const start = async () => {
    setBusy(true);
    setRounds(null);
    await sleep(900);
    setRounds(runBracket(picked));
    setBusy(false);
  };

  const champ = rounds?.at(-1)?.[0]?.win;

  return (
    <div className="lab-body">
      <form className="lab-row" onSubmit={add}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="책 제목 검색해서 참가시키기"
          aria-label="참가 도서 검색"
        />
        <button type="submit" className="btn">
          참가
        </button>
      </form>
      <p className="muted lab-small">추천 도서 (최대 8권, {picked.length}권 선택)</p>
      <div className="lab-chips">
        {[...PRESET, ...picked.filter((p) => !PRESET.some((x) => x.title === p.title))].map((f) => {
          const on = picked.some((x) => x.title === f.title);
          return (
            <button
              key={f.title}
              type="button"
              className={on ? 'lab-chip lab-chip-on' : 'lab-chip'}
              onClick={() => toggle(f)}
            >
              《{f.title}》
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={picked.length < 2 || busy}
        onClick={start}
      >
        {busy ? 'AI 심판 판정 중…' : '배틀 시작'}
      </button>

      {rounds && (
        <div className="lab-bracket">
          {rounds.map((r, i) => (
            <div key={i}>
              <h3>{roundName(i, rounds.length)}</h3>
              <ul>
                {r.map((m, j) => (
                  <li key={j}>
                    <span className={m.win === m.a ? 'lab-win' : 'lab-lose'}>《{m.a.title}》</span>
                    {m.b && (
                      <>
                        <span className="muted"> VS </span>
                        <span className={m.win === m.b ? 'lab-win' : 'lab-lose'}>
                          《{m.b.title}》
                        </span>
                      </>
                    )}
                    <small className="muted"> — {m.why}</small>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {champ && (
            <div className="lab-result">
              🏆 최강 전공책: <strong>《{champ.title}》</strong>
              <div className="muted lab-small">
                난이도 {champ.diff}/10 · {champ.pages}쪽 · 악명 {champ.infamy}/10
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 34. 도서관 소개팅 실패 예측기 ---------- */
const VERDICT = [
  '공부나 하십시오.',
  '상대는 당신이 아니라 뒤의 시계를 봤습니다. 공부나 하십시오.',
  '눈 마주침은 졸음으로 판정되었습니다. 공부나 하십시오.',
];

function DatingPredictor() {
  const [hours, setHours] = useState(6);
  const [eyes, setEyes] = useState(2);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ p: string; msg: string } | null>(null);

  const calc = async () => {
    setBusy(true);
    setRes(null);
    await sleep(1200);
    const p = Math.min(0.0099, Math.max(0, hours) * Math.max(0, eyes) * 0.000025);
    setRes({
      p: p.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.0'),
      msg: VERDICT[Math.floor(Math.random() * VERDICT.length)],
    });
    setBusy(false);
  };

  return (
    <div className="lab-body">
      <div className="lab-grid2">
        <label>
          오늘 도서관에 있던 시간 (시간)
          <input
            type="number"
            min={0}
            max={24}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </label>
        <label>
          눈 마주친 횟수 (회)
          <input
            type="number"
            min={0}
            max={99}
            value={eyes}
            onChange={(e) => setEyes(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="button" className="btn btn-primary" disabled={busy} onClick={calc}>
        {busy ? '10만 건의 도서관 로맨스 분석 중…' : '매칭 확률 계산'}
      </button>
      {res && (
        <div className="lab-result">
          <div className="muted lab-small">
            “오늘 도서관에 {hours}시간 있었고 눈을 {eyes}번 마주쳤습니다.”
          </div>
          <div className="lab-big">성공 확률 {res.p}%</div>
          <strong>{res.msg}</strong>
        </div>
      )}
    </div>
  );
}

/* ---------- 3. 책 낙하 시뮬레이터 ---------- */
const SAMPLE = '/samples/book-tower.png';
const LEVELS = [
  { max: 25, name: '안전 (평지)', cls: 'lv0' },
  { max: 45, name: '살짝 흔들림', cls: 'lv1' },
  { max: 65, name: '피사의 사탑', cls: 'lv2' },
  { max: 85, name: '바벨탑 직전', cls: 'lv3' },
  { max: 101, name: '이미 무너지는 중', cls: 'lv4' },
];

type Tower = { score: number; offsets: number[]; heightCm: number; weightKg: number };

function BookDrop() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [count, setCount] = useState(8);
  const [thick, setThick] = useState(3);
  const [weight, setWeight] = useState(0.8);
  const [busy, setBusy] = useState(false);
  const [tower, setTower] = useState<Tower | null>(null);

  const analyze = async (n: number, t: number, w: number) => {
    setBusy(true);
    setTower(null);
    await sleep(1400);
    const heightCm = n * t;
    const weightKg = +(n * w).toFixed(1);
    const score = Math.min(100, Math.round(heightCm * 1.1 + weightKg * 2 + n * 1.5 + Math.random() * 8));
    const offsets = Array.from({ length: n }, (_, i) =>
      Math.round((Math.random() - 0.5) * (6 + score / 6) * (i / Math.max(1, n - 1) + 0.3)),
    );
    setTower({ score, offsets, heightCm, weightKg });
    setBusy(false);
  };

  // 사진 칸 클릭 → 샘플 사진으로 "분석하는 척"
  const fakePhoto = () => {
    setImg(SAMPLE);
    setCount(11);
    setThick(3.5);
    setWeight(0.9);
    void analyze(11, 3.5, 0.9);
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImg(URL.createObjectURL(f));
    const n = 6 + (f.size % 9);
    setCount(n);
    void analyze(n, thick, weight);
  };

  const lv = tower ? LEVELS.find((l) => tower.score < l.max)! : null;

  return (
    <div className="lab-body">
      <div className="lab-drop-row">
        <button type="button" className="lab-drop" onClick={fakePhoto} aria-label="책탑 사진 넣기">
          {img ? <img src={img} alt="책탑 사진" /> : <span>📷 책탑 사진 넣기<br />(누르면 자동 분석)</span>}
        </button>
        <div className="lab-col">
          <label>
            책 권수
            <input type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <label>
            평균 두께 (cm)
            <input type="number" min={0.5} step={0.5} value={thick} onChange={(e) => setThick(Number(e.target.value))} />
          </label>
          <label>
            평균 무게 (kg)
            <input type="number" min={0.1} step={0.1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </label>
          <div className="lab-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || count < 1}
              onClick={() => analyze(Math.min(30, count), thick, weight)}
            >
              {busy ? '책탑 구조 해석 중…' : '위험도 계산'}
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              내 사진 업로드
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
        </div>
      </div>

      {tower && lv && (
        <div className="lab-tower-wrap">
          <div className={`lab-tower ${lv.cls}`} aria-hidden>
            {tower.offsets.map((o, i) => (
              <div
                key={i}
                className="lab-tbook"
                style={{
                  transform: `translateX(${o}px)`,
                  background: `hsl(${(i * 47) % 360} 45% 45%)`,
                  width: `${110 - ((i * 13) % 30)}px`,
                }}
              />
            ))}
          </div>
          <div className="lab-result">
            <div className="muted lab-small">
              높이 약 {tower.heightCm.toFixed(0)}cm · 총 무게 약 {tower.weightKg}kg
            </div>
            <div className="lab-big">현재 책탑 위험등급: {lv.name}</div>
            <div className="lib-bar" role="progressbar" aria-valuenow={tower.score} aria-valuemin={0} aria-valuemax={100}>
              <div className={tower.score >= 65 ? 'lib-bar-fill lib-full' : 'lib-bar-fill'} style={{ width: `${tower.score}%` }} />
            </div>
            <small className="muted">불안정 지수 {tower.score}/100 · 재미용 추정치. 정확한 안전 판정 아님.</small>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 묶음 ---------- */
const LABS = [
  { id: 'battle', icon: '⚔️', title: '책 배틀로얄', desc: '전공책 토너먼트. AI가 최강 전공책 판정', C: BookBattle },
  { id: 'dating', icon: '💘', title: '도서관 소개팅 실패 예측기', desc: '눈 마주친 그 사람과 연애할 확률 (가짜 통계)', C: DatingPredictor },
  { id: 'tower', icon: '🗼', title: '책 낙하 시뮬레이터', desc: '내 앞의 책탑은 얼마나 위험한가?', C: BookDrop },
];

export function LibraryLab() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="lib-card lab">
      <h2>
        술술 실험실 <span className="lab-tag">아이디어 미리보기</span>
      </h2>
      <ul className="lab-list">
        {LABS.map(({ id, icon, title, desc, C }) => (
          <li key={id}>
            <button
              type="button"
              className="lab-head"
              aria-expanded={open === id}
              onClick={() => setOpen(open === id ? null : id)}
            >
              <span className="lib-icon" aria-hidden>
                {icon}
              </span>
              <span>
                <strong>{title}</strong>
                <span className="muted lab-small">{desc}</span>
              </span>
              <span className="lab-caret" aria-hidden>
                {open === id ? '▲' : '▼'}
              </span>
            </button>
            {open === id && <C />}
          </li>
        ))}
      </ul>
    </div>
  );
}
