import { showAlertWindow } from './pipAlert';

// 노트북(브라우저) 알림. 알림 창 + OS 알림.
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
  // 다른 프로그램 사용 중에도 최상단에 뜨는 창
  showAlertWindow(title, body);
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  // 사용자가 직접 닫을 때까지 유지. 같은 tag 는 재알림(renotify)으로 다시 띄운다.
  const opts = {
    body,
    silent: false,
    requireInteraction: true,
    tag: title,
    renotify: true,
  } as NotificationOptions;
  const fallback = () => {
    try {
      const n = new Notification(title, opts);
      n.onclick = () => window.focus();
    } catch {
      /* 무시 */
    }
  };
  if (!('serviceWorker' in navigator)) return fallback();
  navigator.serviceWorker.ready
    .then((reg) => reg.showNotification(title, opts))
    .catch(fallback);
}
