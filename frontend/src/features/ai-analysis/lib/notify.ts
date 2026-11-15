import { openAlertWindow, showAlertWindow } from './pipAlert';

// 노트북(브라우저) 알림. 항상 위 창(PiP) + OS 알림.
// 클릭 핸들러에서 호출되므로 여기서 PiP 창을 연다 (사용자 제스처 필요).
export async function requestDesktopPermission(): Promise<void> {
  void openAlertWindow();
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
