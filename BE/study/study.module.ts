import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [HttpModule],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule {}
