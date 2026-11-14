import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class CreateSleepLogDto {
  @ApiProperty({ example: '2026-11-15T01:00:00.000Z' })
  @IsDateString()
  startedAt!: string;

  @ApiProperty({ example: '2026-11-15T01:47:32.000Z' })
  @IsDateString()
  endedAt!: string;
}

export class SleepLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endedAt!: Date;

  @ApiProperty({ example: 2852 })
  durationSec!: number;
}
