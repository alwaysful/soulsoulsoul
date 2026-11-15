import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CandidateBookDto {
  @ApiProperty({ example: 'b01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id!: string;

  @ApiProperty({ example: '인공지능: 현대적 접근' })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ example: '러셀' })
  @IsString()
  @MaxLength(60)
  author!: string;

  @ApiProperty({ example: '컴퓨터' })
  @IsString()
  @MaxLength(30)
  category!: string;

  @ApiProperty({ example: 'AI 입문 교재' })
  @IsString()
  @MaxLength(200)
  desc!: string;
}

export class RecommendDto {
  @ApiProperty({ example: '머신러닝을 처음 배우고 싶어요' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  query!: string;

  @ApiProperty({ type: [CandidateBookDto], description: '추천 후보 (최대 50권)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CandidateBookDto)
  books!: CandidateBookDto[];
}

export class PickDto {
  @ApiProperty({ example: 'b01' })
  id!: string;

  @ApiProperty({ example: '입문자용 개념 설명이 잘 되어 있음' })
  reason!: string;
}

export class RecommendResponseDto {
  @ApiProperty({ type: [PickDto] })
  picks!: PickDto[];
}
