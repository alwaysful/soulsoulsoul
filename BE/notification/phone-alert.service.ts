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

  async send(userId: string, deviceId: string): Promise<void> {
    const now = Date.now();
    if (now - (this.lastSent.get(userId) ?? 0) < COOLDOWN_MS) {
      throw new HttpException(
        '알림 전송이 너무 잦습니다.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.lastSent.set(userId, now);

    const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    try {
      const res = await firstValueFrom(
        this.httpService.post<PushResponse>(this.pushUrl, {
          deviceId,
          title: TITLE,
          message,
        }),
      );
      if (res.data.resultCode !== 100) {
        throw new ServiceUnavailableException('푸시 서버가 전송을 거부했습니다.');
      }
      this.logger.log(`Phone alert 성공: ${deviceId}`);
    } catch (e) {
      this.lastSent.delete(userId);
      if (e instanceof HttpException) throw e;
      this.logger.error(
        'Push Server 요청 중 오류 발생',
        e instanceof Error ? e.stack : String(e),
      );
      throw new ServiceUnavailableException('푸시 서버와 통신할 수 없습니다.');
    }
  }
}
