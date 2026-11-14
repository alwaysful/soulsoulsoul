import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi } from '../../../api/categories';
import { postApi } from '../../../api/posts';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { errorText } from '../../../components/format';
import type { Category } from '../../../types';

export function PostFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    postApi
      .get(id)
      .then((p) => {
        if (cancelled) return;
        setTitle(p.title);
        setContent(p.content);
        setCategoryId(String(p.categoryId ?? p.category?.id ?? ''));
      })
      .catch((e: unknown) => !cancelled && setError(errorText(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        content,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };
      const saved = id ? await postApi.update(id, body) : await postApi.create(body);
      navigate(saved?.id ? `/posts/${saved.id}` : '/', { replace: true });
    } catch (err) {
      setError(errorText(err));
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">불러오는 중</p>;

  return (
    <section>
      <h1>{isEdit ? '글 수정' : '글쓰기'}</h1>
      <form onSubmit={handleSubmit} className="form">
        {categories.length > 0 && (
          <label>
            카테고리
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">선택 안 함</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          제목
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          내용
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            required
          />
        </label>
        <ErrorMessage message={error} />
        <div className="row">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '저장 중' : isEdit ? '수정 저장' : '등록'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </form>
    </section>
  );
}
