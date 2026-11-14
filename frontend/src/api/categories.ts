import type { Category } from '../types';
import { request } from './client';

// 백엔드 경로가 다르면 여기만 수정
const BASE = '/category';

export const categoryApi = {
  async list(): Promise<Category[]> {
    const raw = await request<
      Category[] | { data?: Category[]; items?: Category[] }
    >(BASE);
    if (Array.isArray(raw)) return raw;
    return raw.data ?? raw.items ?? [];
  },
};
