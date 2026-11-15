import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { RecommendDto, RecommendResponseDto } from './dto/recommend.dto';
import { LibraryService } from './library.service';

@ApiTags('library')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Post('recommend')
  @HttpCode(200)
  @ApiOperation({ summary: '로컬 AI 책 추천' })
  @ApiOkResponse({ type: RecommendResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  recommend(
    @Req() req: { user: { userId: string } },
    @Body() body: RecommendDto,
  ): Promise<RecommendResponseDto> {
    return this.library.recommend(req.user.userId, body.query, body.books);
  }
}
