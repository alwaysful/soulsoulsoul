import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { AlertKind } from './dto/phone-alert.dto';

const TITLE = '[긴급재난문자] 공부 중 스마트폰 감지';
const MESSAGES = [
  '혹시 게임하는 거 아니죠?',
  '도서관 와이파이 쓰러 오셨군요.',
  '현재 가장 활발하게 활동 중인 신체 부위는 엄지손가락입니다.',
  '이 정도면 집에서 누워서 하시는 게 더 효율적입니다.',
  '지금 그 화면, 내일 시험 범위가 아닙니다.',
  '학점이 당신의 엄지를 지켜보고 있습니다.',
];
const COOLDOWN_MS = 60_000;

const SLEEP_TITLE = '[긴급재난문자] 수면 감지';
const SLEEP_START_MESSAGES = [
  '잘 자요. 공부는 제가 대신 못 합니다.',
  '도서관을 숙박시설로 이용해 주셔서 감사합니다.',
  '오늘의 학습 성과: 렘수면 진입 성공.',
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return [h, m, sec % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

function buildAlert(
  kind: AlertKind,
  durationSec: number,
): { title: string; message: string } {
  switch (kind) {
    case 'sleep-start':
      return { title: SLEEP_TITLE, message: pick(SLEEP_START_MESSAGES) };
    case 'sleep-end':
      return {
        title: SLEEP_TITLE,
        message: `좋은 꿈 꾸셨나요? 회원님이 공부 중 실종된 시간: ${formatDuration(durationSec)}`,
      };
    default:
      return { title: TITLE, message: pick(MESSAGES) };
  }
}

interface PushResponse {
  resultCode: number;
  resultData: { deviceId: string };
}

@Injectable()
export class PhoneAlertService {
  private readonly logger = new Logger(PhoneAlertService.name);
  private readonly pushUrl: string;
  // 사용자별 마지막 전송 시각 (과다 전송 방지)
  private readonly lastSent = new Map<string, number>();

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.pushUrl = `${this.config.getOrThrow<string>('PUSH_SERVER_URL')}/api/push`;
  }

  async send(
    userId: string,
    deviceId: string,
    kind: AlertKind = 'phone',
    durationSec = 0,
  ): Promise<void> {
    const key = `${kind}:${userId}`;
    const now = Date.now();
    if (now - (this.lastSent.get(key) ?? 0) < COOLDOWN_MS) {
      throw new HttpException(
        '알림 전송이 너무 잦습니다.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.lastSent.set(key, now);

    const { title, message } = buildAlert(kind, durationSec);
    try {
      const res = await firstValueFrom(
        this.httpService.post<PushResponse>(this.pushUrl, {
          deviceId,
          title,
          message,
        }),
      );
      if (res.data.resultCode !== 100) {
        throw new ServiceUnavailableException('푸시 서버가 전송을 거부했습니다.');
      }
      this.logger.log(`Alert(${kind}) 성공: ${deviceId}`);
    } catch (e) {
      this.lastSent.delete(key);
      if (e instanceof HttpException) throw e;
      this.logger.error(
        'Push Server 요청 중 오류 발생',
        e instanceof Error ? e.stack : String(e),
      );
      throw new ServiceUnavailableException('푸시 서버와 통신할 수 없습니다.');
    }
  }
}
