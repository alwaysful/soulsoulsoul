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
import { PhoneAlertDto } from './dto/phone-alert.dto';
import { PhoneAlertService } from './phone-alert.service';

@ApiTags('notification')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly phoneAlert: PhoneAlertService) {}

  @Post('phone-alert')
  @HttpCode(200)
  @ApiOperation({ summary: '스마트폰 사용 감지 푸시 전송' })
  @ApiOkResponse({ schema: { example: { sent: true } } })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiTooManyRequestsResponse({ type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ type: ErrorResponseDto })
  async sendPhoneAlert(
    @Req() req: { user: { userId: string } },
    @Body() body: PhoneAlertDto,
  ): Promise<{ sent: boolean }> {
    await this.phoneAlert.send(
      req.user.userId,
      body.deviceId,
      body.kind,
      body.durationSec,
    );
    return { sent: true };
  }
}
