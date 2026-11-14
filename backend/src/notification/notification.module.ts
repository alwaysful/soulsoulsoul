import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PhoneAlertService } from './phone-alert.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, PhoneAlertService],
  exports: [NotificationService, PhoneAlertService],
})
export class NotificationModule {}
