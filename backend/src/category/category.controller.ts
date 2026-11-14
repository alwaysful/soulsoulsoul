import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtGuard } from '../auth/jwt.guard';
import { CategoryService } from './category.service';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly category: CategoryService) {}

  @Get()
  @ApiOperation({ summary: '카테고리 목록' })
  list() {
    return this.category.list();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: '카테고리 생성' })
  create(@Body() body: CreateCategoryDto) {
    return this.category.create(body.name);
  }
}
