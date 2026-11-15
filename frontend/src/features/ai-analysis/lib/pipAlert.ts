// 알림마다 새 팝업 창을 연다. 여러 개가 동시에 뜬다. 확인을 누르면 창이 닫힌다.
// 사이트 팝업 허용 필요.
const W = 360;
const H = 150;
const GAP = 10;

const wins = new Set<Window>();
let seq = 0;

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

export function showAlertWindow(title: string, body: string): void {
  for (const w of wins) if (w.closed) wins.delete(w);
  const slot = wins.size;
  const left = Math.max(0, window.screen.availWidth - W - 20 - slot * 24);
  const top = Math.max(
    0,
    window.screen.availHeight - (H + GAP + 40) * (slot + 1),
  );
  const w = window.open(
    '',
    `study-alert-${seq++}`,
    `popup=yes,width=${W},height=${H},left=${left},top=${top}`,
  );
  if (!w) return;
  wins.add(w);
  w.addEventListener('pagehide', () => wins.delete(w));
  paint(w, title, body, true);
}

export function closeAlertWindow(): void {
  for (const w of wins) w.close();
  wins.clear();
}
