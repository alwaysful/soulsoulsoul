const GENERIC = [
  '회원님, 목이 먼저 졸업하려고 합니다.',
  '인간의 진화 과정을 역행하고 계십니다.',
  '목이 어깨한테 마중 나가는 중입니다.',
  '지금 척추가 사직서를 쓰고 있습니다.',
  '화면이 당신을 부른 게 아니라 당신이 화면을 부르고 있습니다.',
  '허리 펴세요. 학점은 허리에서 나옵니다.',
];

export function pickTurtleMessage(turtlePct: number): string {
  const pool =
    turtlePct >= 30
      ? [`현재 목 상태: 거북이 진화 ${turtlePct}%`, ...GENERIC]
      : GENERIC;
  return pool[Math.floor(Math.random() * pool.length)];
}
