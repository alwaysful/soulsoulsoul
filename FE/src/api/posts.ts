import type { Pagination, Post, PostInput, PostList } from '../types';
import { request } from './client';

// 백엔드 경로가 다르면 여기만 수정
const BASE = '/post';

export interface PostQuery {
  page: number;
  limit: number;
  categoryId?: number;
}

// 응답 형태 차이를 흡수: 배열 키(data/items/posts), 페이지 정보(pagination 또는 평면 필드)
interface RawList extends Partial<Pagination> {
  data?: Post[];
  items?: Post[];
  posts?: Post[];
  pagination?: Pagination;
}

function normalize(raw: RawList | Post[], q: PostQuery): PostList {
  if (Array.isArray(raw)) {
    return {
      items: raw,
      pagination: {
        page: q.page,
        limit: q.limit,
        totalCount: raw.length,
        totalPages: 1,
      },
    };
  }
  const items = raw.data ?? raw.items ?? raw.posts ?? [];
  const p = raw.pagination ?? raw;
  const limit = p.limit ?? q.limit;
  const totalCount = p.totalCount ?? items.length;
  return {
    items,
    pagination: {
      page: p.page ?? q.page,
      limit,
      totalCount,
      totalPages: p.totalPages ?? Math.max(1, Math.ceil(totalCount / limit)),
    },
  };
}

export const postApi = {
  async list(q: PostQuery): Promise<PostList> {
    const raw = await request<RawList | Post[]>(BASE, { query: { ...q } });
    return normalize(raw, q);
  },

  get: (id: number | string) => request<Post>(`${BASE}/${id}`),

  create: (body: PostInput) => request<Post>(BASE, { method: 'POST', body }),

  update: (id: number | string, body: PostInput) =>
    request<Post>(`${BASE}/${id}`, { method: 'PUT', body }),

  remove: (id: number | string) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
