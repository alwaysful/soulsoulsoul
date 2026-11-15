// 알림이 뜰 때 창을 연다. 확인을 누르면 창이 닫힌다.
// 1순위 Document PiP(항상 위, Chrome/Edge 116+), 2순위 팝업 창(사이트 팝업 허용 필요).
interface DocPiP {
  requestWindow(opts?: { width?: number; height?: number }): Promise<Window>;
}

const W = 360;
const H = 150;

let win: Window | null = null;
let opening = false;
let pending: { title: string; body: string } | null = null;

const alive = () => !!win && !win.closed;

function paint(w: Window, title: string, body: string, hot: boolean): void {
  const d = w.document;
  d.title = title;
  d.body.replaceChildren();
  d.body.style.cssText =
    'margin:0;font-family:system-ui,"Noto Sans KR",sans-serif;';
  const box = d.createElement('div');
  box.style.cssText = `box-sizing:border-box;height:100vh;padding:14px 16px;background:${hot ? '#b42318' : '#18222b'};color:#fff;display:flex;flex-direction:column;gap:6px;`;
  const t = d.createElement('strong');
  t.style.fontSize = '14px';
  t.textContent = title;
  const b = d.createElement('div');
  b.style.cssText = 'font-size:16px;font-weight:600;flex:1;';
  b.textContent = body;
  const btn = d.createElement('button');
  btn.textContent = '확인';
  btn.style.cssText =
    'align-self:flex-end;padding:4px 14px;border:0;border-radius:6px;cursor:pointer;';
  btn.onclick = () => w.close();
  box.append(t, b, btn);
  d.body.append(box);
}

async function openWindow(): Promise<Window | null> {
  const dpip = (window as unknown as { documentPictureInPicture?: DocPiP })
    .documentPictureInPicture;
  if (dpip) {
    try {
      return await dpip.requestWindow({ width: W, height: H });
    } catch {
      /* 제스처 없음 등: 팝업으로 */
    }
  }
  const left = Math.max(0, window.screen.availWidth - W - 20);
  const top = Math.max(0, window.screen.availHeight - H - 60);
  return window.open(
    '',
    'study-alert',
    `popup=yes,width=${W},height=${H},left=${left},top=${top}`,
  );
}

function ensureWindow(): void {
  if (alive() || opening) return;
  opening = true;
  void openWindow()
    .then((w) => {
      if (!w) return;
      win = w;
      w.addEventListener('pagehide', () => {
        if (win === w) win = null;
      });
      if (pending) paint(w, pending.title, pending.body, true);
    })
    .catch(() => {})
    .finally(() => {
      opening = false;
      pending = null;
    });
}

export function showAlertWindow(title: string, body: string): void {
  if (alive() && win) {
    paint(win, title, body, true);
    try {
      win.focus();
    } catch {
      /* 무시 */
    }
    return;
  }
  pending = { title, body };
  ensureWindow();
}

export function closeAlertWindow(): void {
  pending = null;
  if (alive()) win?.close();
  win = null;
}
