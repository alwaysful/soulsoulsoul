import { request } from './client';

export type AlertKind = 'phone' | 'sleep-start' | 'sleep-end';

export const notificationApi = {
  phoneAlert: (deviceId: string, kind: AlertKind = 'phone', durationSec?: number) =>
    request<{ sent: boolean }>('/notification/phone-alert', {
      method: 'POST',
      body: { deviceId, kind, durationSec },
    }),
};
