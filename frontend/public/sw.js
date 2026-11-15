// 알림 전용 서비스 워커: 다른 탭/사이트를 보는 중에도 OS 알림을 최상단에 띄운다
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const c = list[0];
        return c ? c.focus() : self.clients.openWindow('/study');
      }),
  );
});
