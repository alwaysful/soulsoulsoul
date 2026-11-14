import type { Pagination as PaginationInfo } from '../types';

interface Props {
  pagination: PaginationInfo;
  onChange: (page: number) => void;
}

const WINDOW = 2;

export function Pagination({ pagination, onChange }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const start = Math.max(1, page - WINDOW);
  const end = Math.min(totalPages, page + WINDOW);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="btn btn-ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={p === page ? 'btn btn-active' : 'btn btn-ghost'}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>
    </nav>
  );
}
