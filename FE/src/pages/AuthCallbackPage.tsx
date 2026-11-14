import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { errorText } from '../components/format';

// BE의 INFOTEAM_CALLBACK_URL 이 이 페이지(/auth/callback)를 가리켜야 한다.
export function AuthCallbackPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // code 는 1회용 → StrictMode 이중 실행 방지
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const search = window.location.search;
    if (!new URLSearchParams(search).has('code')) {
      setError('인증 코드가 없습니다. 다시 로그인해 주세요.');
      return;
    }

    authApi
      .infoteamCallback(search)
      .then(({ accessToken }) => {
        signIn(accessToken);
        navigate('/', { replace: true });
      })
      .catch((err: unknown) => setError(errorText(err)));
  }, [signIn, navigate]);

  if (error) {
    return (
      <section className="narrow">
        <h1>로그인 실패</h1>
        <ErrorMessage message={error} />
        <Link to="/login" className="btn">
          로그인으로 돌아가기
        </Link>
      </section>
    );
  }
  return <p className="muted center">로그인 처리 중</p>;
}
