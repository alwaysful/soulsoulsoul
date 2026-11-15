import { request } from './client';

export interface ScreenCheck {
  distracted: boolean;
  activity: string;
  distractPct: number;
  summary: string;
  message: string | null;
}

export const studyApi = {
  screenCheck: (image: string) =>
    request<ScreenCheck>('/study/screen-check', {
      method: 'POST',
      body: { image },
    }),
};
