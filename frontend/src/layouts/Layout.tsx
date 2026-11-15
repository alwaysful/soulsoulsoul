import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            T-GPT
          </Link>
          <nav className="topbar-nav">
            <Link to="/study" className="btn btn-primary">
              공부
            </Link>
            {user ? (
              <>
                <span className="muted">{user.email}</span>
                <button type="button" className="btn btn-ghost" onClick={handleSignOut}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  로그인
                </Link>
                <Link to="/signup" className="btn">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
