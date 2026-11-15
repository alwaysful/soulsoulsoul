// 노트북(브라우저) 알림. 소리/진동 없이 조용히 띄운다.
export async function requestDesktopPermission(): Promise<void> {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'default') return;
  try {
    await Notification.requestPermission();
  } catch {
    /* 무시 */
  }
}

export function notifyDesktop(title: string, body: string): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    // 사용자가 직접 닫을 때까지 유지
    new Notification(title, {
      body,
      silent: true,
      requireInteraction: true,
    } as NotificationOptions);
  } catch {
    /* 무시 */
  }
}
