import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSleepLogDto, SleepLogResponseDto } from './dto/sleep-log.dto';

const MAX_SEC = 86_400;
const CLOCK_SKEW_MS = 60_000;
const SELECT = {
  id: true,
  startedAt: true,
  endedAt: true,
  durationSec: true,
} as const;

@Injectable()
export class SleepService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateSleepLogDto): Promise<SleepLogResponseDto> {
    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);
    const durationSec = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
    if (
      durationSec <= 0 ||
      durationSec > MAX_SEC ||
      endedAt.getTime() > Date.now() + CLOCK_SKEW_MS
    ) {
      throw new BadRequestException('수면 기록 시간이 올바르지 않습니다.');
    }
    return this.prisma.sleepLog.create({
      data: { userId, startedAt, endedAt, durationSec },
      select: SELECT,
    });
  }

  list(userId: string): Promise<SleepLogResponseDto[]> {
    return this.prisma.sleepLog.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 50,
      select: SELECT,
    });
  }
}
