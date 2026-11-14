import type { TokenResponse, User } from '../types';
import { API_URL, request } from './client';

export interface SignupInput {
  email: string;
  password: string;
  username?: string;
}

export const authApi = {
  signup: (body: SignupInput) =>
    request<User>('/auth/signup', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body }),

  // 브라우저를 InfoTeam 로그인 페이지로 보낸다
  infoteamLoginUrl: `${API_URL}/auth/infoteam`,

  // IDP가 돌려준 ?code=... 를 그대로 백엔드 콜백에 전달
  infoteamCallback: (search: string) =>
    request<TokenResponse>(`/auth/infoteam/callback${search}`),
};
