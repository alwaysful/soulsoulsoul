import { request } from './client';

export interface CandidateBook {
  id: string;
  title: string;
  author: string;
  category: string;
  desc: string;
}

export interface BookPick {
  id: string;
  reason: string;
}

export const libraryApi = {
  recommend: (query: string, books: CandidateBook[]) =>
    request<{ picks: BookPick[] }>('/library/recommend', {
      method: 'POST',
      body: { query, books },
    }),
};
