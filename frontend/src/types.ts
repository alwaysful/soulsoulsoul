export interface User {
  id: string;
  email: string;
  username: string | null;
  provider: string | null;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Author {
  id: string;
  email?: string;
  username?: string | null;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryId?: number | null;
  category?: Category | null;
  authorId?: string | null;
  author?: Author | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PostInput {
  title: string;
  content: string;
  categoryId?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface PostList {
  items: Post[];
  pagination: Pagination;
}
