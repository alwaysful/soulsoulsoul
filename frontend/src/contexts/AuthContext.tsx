import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { UNAUTHORIZED_EVENT, tokenStore } from '../api/client';

// 백엔드 JwtStrategy.validate 가 돌려주는 payload 형태
export interface AuthUser {
  userId: string;
  email: string;
}

interface JwtPayload extends AuthUser {
  exp?: number;
}

function decode(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as Partial<JwtPayload>;
    if (!payload.userId || !payload.email) return null;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

function loadToken(): string | null {
  const token = tokenStore.get();
  if (token && decode(token)) return token;
  tokenStore.clear();
  return null;
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadToken);

  const signIn = useCallback((t: string) => {
    tokenStore.set(t);
    setToken(t);
  }, []);

  const signOut = useCallback(() => {
    tokenStore.clear();
    setToken(null);
  }, []);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
  }, [signOut]);

  const user = useMemo(() => (token ? decode(token) : null), [token]);
  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
