import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CreateSleepLogDto, SleepLogResponseDto } from './dto/sleep-log.dto';
import { SleepService } from './sleep.service';

@ApiTags('sleep')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('sleep-log')
export class SleepController {
  constructor(private readonly sleep: SleepService) {}

  @Post()
  @ApiOperation({ summary: '수면 기록 저장' })
  @ApiCreatedResponse({ type: SleepLogResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  create(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateSleepLogDto,
  ): Promise<SleepLogResponseDto> {
    return this.sleep.create(req.user.userId, body);
  }

  @Get()
  @ApiOperation({ summary: '내 수면 기록 (최근 50건)' })
  @ApiOkResponse({ type: [SleepLogResponseDto] })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  list(@Req() req: { user: { userId: string } }): Promise<SleepLogResponseDto[]> {
    return this.sleep.list(req.user.userId);
  }
}
