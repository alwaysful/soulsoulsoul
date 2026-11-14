import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { SleepController } from './sleep.controller';
import { SleepService } from './sleep.service';

@Module({
  imports: [PrismaModule],
  controllers: [SleepController],
  providers: [SleepService],
})
export class SleepModule {}
