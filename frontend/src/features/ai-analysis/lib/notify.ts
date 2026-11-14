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
    new Notification(title, { body, silent: true });
  } catch {
    /* 무시 */
  }
}
