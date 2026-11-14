import { request } from './client';

export interface SleepLog {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
}

export const sleepApi = {
  create: (body: { startedAt: string; endedAt: string }) =>
    request<SleepLog>('/sleep-log', { method: 'POST', body }),

  list: () => request<SleepLog[]>('/sleep-log'),
};
