import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class ScreenCheckDto {
  @ApiProperty({ description: 'JPEG base64 (data: 접두어 없이)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3_000_000)
  @Matches(/^[A-Za-z0-9+/=]+$/)
  image!: string;
}

export class ScreenCheckResponseDto {
  @ApiProperty({ example: true })
  distracted!: boolean;

  @ApiProperty({ example: 'game', description: 'study|game|video|sns|shopping|other' })
  activity!: string;

  @ApiProperty({ example: 87, description: '딴짓 확률 0~100' })
  distractPct!: number;

  @ApiProperty({ example: '게임 화면이 전체 화면으로 열려 있음' })
  summary!: string;

  @ApiProperty({ type: String, nullable: true, example: '교수님이 주신 퀘스트부터 완료하시죠.' })
  message!: string | null;
}
