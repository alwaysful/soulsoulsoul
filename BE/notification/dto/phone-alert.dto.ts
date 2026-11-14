import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PhoneAlertDto {
  @ApiProperty({ description: '푸시를 받을 스마트폰 기기 ID', example: 'device-abc-123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  deviceId!: string;
}
