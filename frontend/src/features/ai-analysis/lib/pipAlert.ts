// 알림마다 새 팝업 창을 연다. 화면 가운데에 뜨고, 이미 있으면 1mm(≈4px)씩 대각선으로 밀려 겹친다.
// 확인을 누르면 창이 닫힌다. 사이트 팝업 허용 필요.
const W = 432; // 360 * 1.2
const H = 180; // 150 * 1.2
const STEP = 4; // 1mm ≈ 3.78px

const wins = new Map<Window, number>(); // 창 -> 겹침 순번
let seq = 0;

function freeSlot(): number {
  const used = new Set(wins.values());
  let i = 0;
  while (used.has(i)) i++;
  return i;
}

function paint(w: Window, title: string, body: string, hot: boolean): void {
  const d = w.document;
  d.title = title;
  d.body.replaceChildren();
  d.body.style.cssText =
    'margin:0;font-family:system-ui,"Noto Sans KR",sans-serif;';
  const box = d.createElement('div');
  box.style.cssText = `box-sizing:border-box;height:100vh;padding:17px 19px;background:${hot ? '#b42318' : '#18222b'};color:#fff;display:flex;flex-direction:column;gap:7px;`;
  const t = d.createElement('strong');
  t.style.fontSize = '17px';
  t.textContent = title;
  const b = d.createElement('div');
  b.style.cssText = 'font-size:19px;font-weight:600;flex:1;';
  b.textContent = body;
  const btn = d.createElement('button');
  btn.textContent = '확인';
  btn.style.cssText =
    'align-self:flex-end;padding:5px 17px;border:0;border-radius:7px;cursor:pointer;font-size:16px;';
  btn.onclick = () => w.close();
  box.append(t, b, btn);
  d.body.append(box);
}

export function showAlertWindow(title: string, body: string): void {
  for (const w of wins.keys()) if (w.closed) wins.delete(w);
  const slot = freeSlot();
  const left = Math.max(
    0,
    Math.round((window.screen.availWidth - W) / 2) + slot * STEP,
  );
  const top = Math.max(
    0,
    Math.round((window.screen.availHeight - H) / 2) + slot * STEP,
  );
  const w = window.open(
    '',
    `study-alert-${seq++}`,
    `popup=yes,width=${W},height=${H},left=${left},top=${top}`,
  );
  if (!w) return;
  wins.set(w, slot);
  w.addEventListener('pagehide', () => wins.delete(w));
  paint(w, title, body, true);
}

export function closeAlertWindow(): void {
  for (const w of wins.keys()) w.close();
  wins.clear();
}
