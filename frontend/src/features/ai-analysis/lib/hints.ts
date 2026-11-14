const pick = (list: string[]): string =>
  list[Math.floor(Math.random() * list.length)];

const SLEEP_START = [
  '잘 자요. 공부는 제가 대신 못 합니다.',
  '도서관을 숙박시설로 이용해 주셔서 감사합니다.',
  '오늘의 학습 성과: 렘수면 진입 성공.',
];

const PHONE = [
  '혹시 게임하는 거 아니죠?',
  '도서관 와이파이 쓰러 오셨군요.',
  '현재 가장 활발하게 활동 중인 신체 부위는 엄지손가락입니다.',
  '이 정도면 집에서 누워서 하시는 게 더 효율적입니다.',
  '지금 그 화면, 내일 시험 범위가 아닙니다.',
  '학점이 당신의 엄지를 지켜보고 있습니다.',
];

const SLACK = [
  '학점은 브론즈인데 게임은 다이아시네요.',
  '교수님이 주신 퀘스트부터 완료하시죠.',
  '현재 게임 승률보다 과제 제출 확률이 낮아 보입니다.',
];

export const pickSleepStart = () => pick(SLEEP_START);
export const pickPhoneMessage = () => pick(PHONE);
export const pickSlackMessage = () => pick(SLACK);
