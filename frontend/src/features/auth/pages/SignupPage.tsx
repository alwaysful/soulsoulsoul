import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { ErrorMessage } from '../../../components/ErrorMessage';
import { errorText } from '../../../components/format';

export function SignupPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApi.signup({
        email,
        password,
        username: username.trim() || undefined,
      });
      // 가입 후 바로 로그인
      const { accessToken } = await authApi.login({ email, password });
      signIn(accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="narrow">
      <h1>회원가입</h1>
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
          닉네임 (선택)
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="nickname"
          />
        </label>
        <label>
          비밀번호 (6자 이상)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <ErrorMessage message={error} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '가입 중' : '가입하기'}
        </button>
      </form>
      <p className="muted center">
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </section>
  );
}
