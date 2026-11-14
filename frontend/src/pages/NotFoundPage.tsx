import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="narrow">
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link to="/" className="btn">
        목록으로
      </Link>
    </section>
  );
}
