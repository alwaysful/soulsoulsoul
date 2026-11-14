// 1회 실행: node scripts/move-backend.mjs
// BE/* -> backend/src/*, import 경로와 설정 파일 갱신
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

if (!existsSync('BE')) {
  console.error('BE 폴더 없음. 프로젝트 루트에서 실행.');
  process.exit(1);
}

const SRC = join('backend', 'src');
mkdirSync(SRC, { recursive: true });
const changed = [];

// 1. 이동
for (const name of readdirSync('BE')) {
  const dest = join(SRC, name);
  if (existsSync(dest)) {
    console.error(`이미 존재: ${dest}`);
    process.exit(1);
  }
  renameSync(join('BE', name), dest);
}
try {
  rmdirSync('BE');
} catch {
  console.warn('BE 폴더가 남음. 직접 삭제.');
}

// 2. 루트 prisma/, generated/ 참조 경로: 한 단계 더 올라간다
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
};
const IMPORT_RE = /(['"])((?:\.\.\/)+)(prisma|generated)\//g;
for (const f of walk(SRC)) {
  const s = readFileSync(f, 'utf8');
  const t = s.replace(IMPORT_RE, (_, q, up, d) => `${q}${up}../${d}/`);
  if (t !== s) {
    writeFileSync(f, t);
    changed.push(f);
  }
}

// 3. 루트 설정 파일의 BE 경로
const CFG =
  /^(package\.json|tsconfig.*\.json|nest-cli\.json|eslint\.config\.\w+|\.eslintrc.*|jest\.config.*|\.prettierignore|\.dockerignore|Dockerfile)$/;
for (const n of readdirSync('.')) {
  if (!CFG.test(n)) continue;
  const s = readFileSync(n, 'utf8');
  const t = s
    .replace(/(?<![\w-])BE(?=\/)/g, 'backend/src')
    .replace(/(?<=["'])BE(?=["'])/g, 'backend/src');
  if (t !== s) {
    writeFileSync(n, t);
    changed.push(n);
  }
}

// 4. 루트 package.json 에 프론트 스크립트 추가 (기존 키 유지)
if (existsSync('package.json')) {
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    pkg.scripts ??= {};
    pkg.scripts['fe:dev'] ??= 'npm --prefix frontend run dev';
    pkg.scripts['fe:build'] ??= 'npm --prefix frontend run build';
    writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    if (!changed.includes('package.json')) changed.push('package.json');
  } catch {
    console.warn('package.json 파싱 실패. fe:dev / fe:build 직접 추가.');
  }
}

// 5. README
if (existsSync('README.md')) {
  const s = readFileSync('README.md', 'utf8');
  const t = s.replace(
    '- `BE/` NestJS (이동 예정 → `backend/src`)',
    '- `backend/src/` NestJS',
  );
  if (t !== s) {
    writeFileSync('README.md', t);
    changed.push('README.md');
  }
}

console.log('수정된 파일:\n' + changed.map((f) => `  ${f}`).join('\n'));
console.log('\n다음: npx tsc --noEmit  /  npm run build  /  npx prisma generate');
