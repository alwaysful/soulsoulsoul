import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { ScreenCheckDto, ScreenCheckResponseDto } from './dto/screen-check.dto';
import { StudyService } from './study.service';

@ApiTags('study')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('study')
export class StudyController {
  constructor(private readonly study: StudyService) {}

  @Post('screen-check')
  @HttpCode(200)
  @ApiOperation({ summary: '노트북 화면 캡처 분석 (딴짓 판별)' })
  @ApiOkResponse({ type: ScreenCheckResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  screenCheck(
    @Req() req: { user: { userId: string } },
    @Body() body: ScreenCheckDto,
  ): Promise<ScreenCheckResponseDto> {
    return this.study.check(req.user.userId, body.image, body.model);
  }
}
