// Document Picture-in-Picture: 다른 창 위에 항상 떠 있는 알림 창 (Chrome/Edge 116+)
interface DocPiP {
  requestWindow(opts?: { width?: number; height?: number }): Promise<Window>;
}

const IDLE_TITLE = '감시 중';
const IDLE_BODY = '딴짓하면 여기 뜹니다.';

let win: Window | null = null;
let titleEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let box: HTMLElement | null = null;
let opening = false;

const api = (): DocPiP | null =>
  (window as unknown as { documentPictureInPicture?: DocPiP })
    .documentPictureInPicture ?? null;

const alive = () => !!win && !win.closed;

function render(title: string, body: string, hot: boolean): void {
  if (!alive() || !titleEl || !bodyEl || !box) return;
  titleEl.textContent = title;
  bodyEl.textContent = body;
  box.style.background = hot ? '#b42318' : '#18222b';
}

export async function openAlertWindow(): Promise<void> {
  const dpip = api();
  if (!dpip || alive() || opening) return;
  opening = true;
  try {
    const w = await dpip.requestWindow({ width: 360, height: 150 });
    const d = w.document;
    d.body.style.cssText =
      'margin:0;font-family:system-ui,"Noto Sans KR",sans-serif;';
    box = d.createElement('div');
    box.style.cssText =
      'box-sizing:border-box;height:100vh;padding:14px 16px;color:#fff;display:flex;flex-direction:column;gap:6px;';
    titleEl = d.createElement('strong');
    titleEl.style.fontSize = '14px';
    bodyEl = d.createElement('div');
    bodyEl.style.cssText = 'font-size:16px;font-weight:600;flex:1;';
    const btn = d.createElement('button');
    btn.textContent = '확인';
    btn.style.cssText =
      'align-self:flex-end;padding:4px 14px;border:0;border-radius:6px;cursor:pointer;';
    btn.onclick = () => render(IDLE_TITLE, IDLE_BODY, false);
    box.append(titleEl, bodyEl, btn);
    d.body.append(box);
    w.addEventListener('pagehide', () => {
      win = null;
    });
    win = w;
    render(IDLE_TITLE, IDLE_BODY, false);
  } catch {
    /* 미지원/거부: OS 알림만 사용 */
  } finally {
    opening = false;
  }
}

export function showAlertWindow(title: string, body: string): void {
  render(title, body, true);
}

export function closeAlertWindow(): void {
  if (alive()) win?.close();
  win = null;
}
