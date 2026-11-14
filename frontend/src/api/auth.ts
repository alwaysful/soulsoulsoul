import type { TokenResponse, User } from '../types';
import { request } from './client';

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
};
