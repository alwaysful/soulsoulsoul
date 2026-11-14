import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const ALERT_KINDS = ['phone', 'sleep-start', 'sleep-end'] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

export class PhoneAlertDto {
  @ApiProperty({ description: '푸시를 받을 스마트폰 기기 ID', example: 'device-abc-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  deviceId!: string;

  @ApiPropertyOptional({ enum: ALERT_KINDS, default: 'phone' })
  @IsOptional()
  @IsIn(ALERT_KINDS)
  kind?: AlertKind;

  @ApiPropertyOptional({ description: '수면 시간(초). sleep-end 전용', example: 2852 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86_400)
  durationSec?: number;
}
