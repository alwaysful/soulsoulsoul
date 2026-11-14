import { request } from './client';

export const SCREEN_MODELS = [
  'qwen3-vl:4b',
  'qwen3.5:9b',
  'gemma4:12b',
] as const;
export type ScreenModel = (typeof SCREEN_MODELS)[number];
export const DEFAULT_SCREEN_MODEL: ScreenModel = SCREEN_MODELS[0];

export interface ScreenCheck {
  distracted: boolean;
  activity: string;
  distractPct: number;
  summary: string;
  message: string | null;
}

export const studyApi = {
  screenCheck: (image: string, model?: ScreenModel) =>
    request<ScreenCheck>('/study/screen-check', {
      method: 'POST',
      body: { image, model },
    }),
};
