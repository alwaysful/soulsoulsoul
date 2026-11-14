export const QUIT_PROMPT = '5분 뒤에 끄는 건 어떤가요?';
export const QUIT_DONE = '이제 가셔도 됩니다. 아쉽진 않습니다.';

// 단계가 오를수록 깐깐해진다 (0~3)
const BY_LEVEL: string[][] = [
  [
    '잠깐만요. 5분만 더 하면 집중력 폭발합니다.',
    '지금 끄면 방금까지 한 공부가 아깝지 않나요?',
  ],
  [
    '벌써 포기하시게요? 아직 1분밖에 안 지났습니다.',
    '엉덩이가 아직 의자와 이별할 준비가 안 됐습니다.',
  ],
  [
    '자세 보세요. 그 자세로 끄시게요?',
    '종료 버튼은 타이머가 끝나야 나옵니다. 저는 기다립니다.',
  ],
  [
    '거의 다 왔는데 여기서 보채십니까?',
    '마지막 스퍼트입니다. 화면 말고 책을 보세요.',
  ],
];

export function pickQuitMessage(level: number): string {
  const pool = BY_LEVEL[Math.min(Math.max(level, 0), BY_LEVEL.length - 1)];
  return pool[Math.floor(Math.random() * pool.length)];
}
