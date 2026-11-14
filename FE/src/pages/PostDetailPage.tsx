import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { postApi } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { errorText, formatDate } from '../components/format';
import type { Post } from '../types';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setPost(null);
    setError(null);
    postApi
      .get(id)
      .then((p) => !cancelled && setPost(p))
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof ApiError && e.status === 404
            ? '글을 찾을 수 없습니다.'
            : errorText(e),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const authorId = post?.authorId ?? post?.author?.id;
  // 작성자 정보가 없으면 로그인 사용자에게 버튼을 보이고, 권한은 서버가 검사한다
  const canEdit = !!user && (!authorId || authorId === user.userId);

  const handleDelete = async () => {
    if (!id || !window.confirm('이 글을 삭제할까요?')) return;
    setBusy(true);
    setError(null);
    try {
      await postApi.remove(id);
      navigate('/', { replace: true });
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  if (error && !post) {
    return (
      <section>
        <ErrorMessage message={error} />
        <Link to="/" className="btn">
          목록으로
        </Link>
      </section>
    );
  }
  if (!post) return <p className="muted">불러오는 중</p>;

  return (
    <article>
      <p className="post-meta">
        {post.category?.name && <span className="tag">{post.category.name}</span>}
        {post.author && <span>{post.author.username ?? post.author.email}</span>}
        <span>{formatDate(post.createdAt)}</span>
      </p>
      <h1>{post.title}</h1>
      <div className="post-body">{post.content}</div>
      <ErrorMessage message={error} />
      <div className="row">
        <Link to="/" className="btn btn-ghost">
          목록으로
        </Link>
        {canEdit && (
          <>
            <Link to={`/posts/${post.id}/edit`} className="btn">
              수정
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={handleDelete}
            >
              삭제
            </button>
          </>
        )}
      </div>
    </article>
  );
}
