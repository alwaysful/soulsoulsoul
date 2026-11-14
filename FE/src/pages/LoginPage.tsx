import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { errorText } from '../components/format';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await authApi.login({ email, password });
      signIn(accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="narrow">
      <h1>로그인</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <ErrorMessage message={error} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '로그인 중' : '로그인'}
        </button>
      </form>
      <div className="divider">또는</div>
      <a className="btn btn-block" href={authApi.infoteamLoginUrl}>
        InfoTeam 계정으로 로그인
      </a>
      <p className="muted center">
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </section>
  );
}
