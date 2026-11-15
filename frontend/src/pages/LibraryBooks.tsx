import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { libraryApi, type BookPick } from '../api/library';
import { errorText } from '../components/format';
import './library-books.css';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  copies: number;
  desc: string;
}

const BOOKS: Book[] = [
  { id: 'b01', title: '인공지능: 현대적 접근', author: '러셀', category: '컴퓨터', copies: 2, desc: 'AI 전반을 다루는 대표 교재' },
  { id: 'b02', title: '밑바닥부터 시작하는 딥러닝', author: '사이토 고키', category: '컴퓨터', copies: 3, desc: '딥러닝을 직접 구현하며 배우는 입문서' },
  { id: 'b03', title: '핸즈온 머신러닝', author: '제롱', category: '컴퓨터', copies: 1, desc: '사이킷런과 텐서플로로 배우는 머신러닝 실습' },
  { id: 'b04', title: '자료구조와 알고리즘', author: '박지훈', category: '컴퓨터', copies: 4, desc: '코딩 테스트 대비 기초 알고리즘' },
  { id: 'b05', title: '데이터베이스 설계', author: '정하늘', category: '컴퓨터', copies: 0, desc: '관계형 모델과 SQL 설계 원리' },
  { id: 'b06', title: '선형대수학의 이해', author: '이서연', category: '수학', copies: 2, desc: '벡터, 행렬, 고유값 기초' },
  { id: 'b07', title: '확률과 통계', author: '최민호', category: '수학', copies: 3, desc: '공학도를 위한 확률 통계 입문' },
  { id: 'b08', title: '현대 물리학', author: '최유진', category: '물리', copies: 1, desc: '양자역학과 상대성 이론 개론' },
  { id: 'b09', title: '코스모스', author: '칼 세이건', category: '과학', copies: 2, desc: '우주와 인류를 다룬 교양 과학서' },
  { id: 'b10', title: '이기적 유전자', author: '리처드 도킨스', category: '과학', copies: 1, desc: '진화생물학 교양서' },
  { id: 'b11', title: '사피엔스', author: '유발 하라리', category: '인문', copies: 0, desc: '인류사를 조망하는 교양서' },
  { id: 'b12', title: '정의란 무엇인가', author: '마이클 샌델', category: '인문', copies: 2, desc: '정의와 도덕 철학 입문' },
  { id: 'b13', title: '클린 코드', author: '로버트 마틴', category: '컴퓨터', copies: 2, desc: '읽기 좋은 코드 작성법' },
  { id: 'b14', title: '논문 잘 쓰는 법', author: '김도윤', category: '글쓰기', copies: 3, desc: '이공계 학술 논문 작성 가이드' },
  { id: 'b15', title: '경제학 콘서트', author: '팀 하포드', category: '경제', copies: 2, desc: '일상 속 경제 원리 교양서' },
  { id: 'b16', title: '운영체제 개념', author: '실버슈나츠', category: '컴퓨터', copies: 1, desc: '프로세스, 메모리, 파일 시스템' },
];

const LOAN_KEY = 'libBookLoans';
const MAX_LOANS = 5;
const LOAN_DAYS = 14;
const DAY = 86_400_000;

interface Loan {
  id: string;
  due: number;
}

function loadLoans(): Loan[] {
  try {
    return JSON.parse(localStorage.getItem(LOAN_KEY) ?? '[]') as Loan[];
  } catch {
    return [];
  }
}

const fmt = (t: number) => new Date(t).toLocaleDateString('ko-KR');

interface RowProps {
  book: Book;
  loaned: boolean;
  full: boolean;
  reason?: string;
  onLoan: () => void;
}

function BookRow({ book, loaned, full, reason, onLoan }: RowProps) {
  const left = book.copies - (loaned ? 1 : 0);
  const label = loaned ? '신청됨' : left <= 0 ? '대출불가' : full ? '한도 초과' : '대출 신청';
  return (
    <li>
      <div>
        <strong>{book.title}</strong>
        <span className="lb-meta">
          {book.author} · {book.category} · {book.desc}
        </span>
        <span className={left > 0 ? 'lb-ok' : 'lb-no'}>
          {left > 0 ? `대출가능 ${left}권` : '대출중'}
        </span>
        {reason && <span className="lb-reason">AI: {reason}</span>}
      </div>
      <button
        type="button"
        className="btn"
        disabled={loaned || left <= 0 || full}
        onClick={onLoan}
      >
        {label}
      </button>
    </li>
  );
}

export function BookSearch() {
  const [q, setQ] = useState('');
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [loans, setLoans] = useState<Loan[]>(loadLoans);
  const [wish, setWish] = useState('');
  const [picks, setPicks] = useState<BookPick[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLoans = (next: Loan[]) => {
    setLoans(next);
    try {
      localStorage.setItem(LOAN_KEY, JSON.stringify(next));
    } catch {
      /* 무시 */
    }
  };
  const loan = (id: string) =>
    saveLoans([...loans, { id, due: Date.now() + LOAN_DAYS * DAY }]);
  const giveBack = (id: string) => saveLoans(loans.filter((l) => l.id !== id));

  const isLoaned = (id: string) => loans.some((l) => l.id === id);
  const full = loans.length >= MAX_LOANS;
  const key = q.trim().toLowerCase();
  const results = BOOKS.filter(
    (b) =>
      (!onlyAvail || b.copies - (isLoaned(b.id) ? 1 : 0) > 0) &&
      (!key || `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(key)),
  );

  const recommend = async (e: FormEvent) => {
    e.preventDefault();
    const query = wish.trim();
    if (!query) return;
    setBusy(true);
    setError(null);
    setPicks(null);
    try {
      const books = BOOKS.map(({ id, title, author, category, desc }) => ({
        id,
        title,
        author,
        category,
        desc,
      }));
      const res = await libraryApi.recommend(query, books);
      setPicks(res.picks);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? '추천은 로그인 후 이용할 수 있습니다.'
          : errorText(err),
      );
    } finally {
      setBusy(false);
    }
  };

  const row = (b: Book, reason?: string) => (
    <BookRow
      key={b.id}
      book={b}
      loaned={isLoaned(b.id)}
      full={full}
      reason={reason}
      onLoan={() => loan(b.id)}
    />
  );

  return (
    <>
      <form className="lp-form lb-reco" onSubmit={recommend}>
        <input
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="AI 추천: 어떤 책을 찾나요? (예: 머신러닝 입문)"
          aria-label="AI 추천 요청"
          maxLength={300}
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? '추천 중' : 'AI 추천'}
        </button>
        {error && <p className="error">{error}</p>}
        {picks && (
          <ul className="lp-list" style={{ width: '100%' }}>
            {picks.length === 0 && <li className="muted">맞는 책을 찾지 못했습니다.</li>}
            {picks.map((p) => {
              const b = BOOKS.find((x) => x.id === p.id);
              return b ? row(b, p.reason) : null;
            })}
          </ul>
        )}
      </form>

      <div className="lp-form">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목·저자·분야 검색"
          aria-label="도서 검색"
        />
        <label className="lr-check">
          <input
            type="checkbox"
            checked={onlyAvail}
            onChange={(e) => setOnlyAvail(e.target.checked)}
          />
          대출가능만
        </label>
      </div>
      <ul className="lp-list">
        {results.length === 0 && <li className="muted">검색 결과 없음</li>}
        {results.map((b) => row(b))}
      </ul>

      <h3 className="lb-h" style={{ marginTop: 20 }}>
        내 대출 신청 ({loans.length}/{MAX_LOANS})
      </h3>
      {loans.length === 0 ? (
        <p className="muted">신청 내역 없음</p>
      ) : (
        <ul className="lp-list">
          {loans.map((l) => {
            const b = BOOKS.find((x) => x.id === l.id);
            return (
              <li key={l.id}>
                <div>
                  <strong>{b?.title ?? l.id}</strong>
                  <span className="muted">반납예정 {fmt(l.due)}</span>
                </div>
                <button type="button" className="btn" onClick={() => giveBack(l.id)}>
                  취소/반납
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
