import './library.css';

const LINKS = [
  { title: '자료 검색', desc: '소장 도서·논문·전자자료' },
  { title: '열람실 좌석', desc: '실시간 좌석 현황·예약' },
  { title: '내 서재', desc: '대출·반납·예약 현황' },
  { title: '전자도서관', desc: '전자책·학술DB' },
  { title: '스터디룸 예약', desc: '그룹 학습 공간 신청' },
  { title: '공지사항', desc: '휴관일·운영시간 안내' },
];

export function LibraryPage() {
  return (
    <section className="library">
      <h1>술술 도서관</h1>
      <p className="muted">열람 시간 09:00 – 22:00</p>
      <ul className="library-links">
        {LINKS.map((l) => (
          <li key={l.title}>
            <a href="#" className="library-link" onClick={(e) => e.preventDefault()}>
              <strong>{l.title}</strong>
              <span>{l.desc}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
