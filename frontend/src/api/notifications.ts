import { request } from './client';

export const notificationApi = {
  phoneAlert: (deviceId: string) =>
    request<{ sent: boolean }>('/notification/phone-alert', {
      method: 'POST',
      body: { deviceId },
    }),
};
