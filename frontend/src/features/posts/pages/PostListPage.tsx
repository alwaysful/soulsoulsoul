import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categoryApi } from '../../../api/categories';
import { postApi } from '../../../api/posts';
import { useAuth } from '../../../contexts/AuthContext';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { Pagination } from '../../../components/Pagination';
import { errorText, formatDate } from '../../../components/format';
import type { Category, PostList } from '../../../types';

const LIMIT = 10;

export function PostListPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const categoryId = Number(params.get('category')) || undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [list, setList] = useState<PostList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    postApi
      .list({ page, limit: LIMIT, categoryId })
      .then((res) => !cancelled && setList(res))
      .catch((e: unknown) => !cancelled && setError(errorText(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, categoryId]);

  const update = (next: { page?: number; category?: number }) => {
    const p = new URLSearchParams();
    const c = 'category' in next ? next.category : categoryId;
    if (c) p.set('category', String(c));
    if (next.page && next.page > 1) p.set('page', String(next.page));
    setParams(p);
  };

  return (
    <section>
      <div className="row between">
        <h1>글 목록</h1>
        {user && (
          <Link to="/posts/new" className="btn btn-primary">
            글쓰기
          </Link>
        )}
      </div>

      {categories.length > 0 && (
        <div className="filters" role="tablist" aria-label="카테고리">
          <button
            type="button"
            className={!categoryId ? 'chip chip-active' : 'chip'}
            onClick={() => update({ category: undefined })}
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={categoryId === c.id ? 'chip chip-active' : 'chip'}
              onClick={() => update({ category: c.id })}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <ErrorMessage message={error} />
      {loading && !list && <p className="muted">불러오는 중</p>}

      {list && (
        <>
          {list.items.length === 0 ? (
            <p className="empty">
              아직 글이 없습니다.
              {user ? ' 첫 글을 작성해 보세요.' : ' 로그인하고 첫 글을 작성해 보세요.'}
            </p>
          ) : (
            <ul className="posts" aria-busy={loading}>
              {list.items.map((p) => (
                <li key={p.id}>
                  <Link to={`/posts/${p.id}`} className="post-row">
                    <span className="post-title">{p.title}</span>
                    <span className="post-meta">
                      {p.category?.name && <span className="tag">{p.category.name}</span>}
                      {p.author && (
                        <span>{p.author.username ?? p.author.email}</span>
                      )}
                      <span>{formatDate(p.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Pagination
            pagination={list.pagination}
            onChange={(n) => update({ page: n })}
          />
        </>
      )}
    </section>
  );
}
