import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { NotificationModule } from './notification/notification.module';
import { SleepModule } from './sleep/sleep.module';
import { StudyModule } from './study/study.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      // 기동 시점에 필수 환경변수를 검증하고 기본값/타입 변환을 적용한다
      validate: validateEnv,
    }),
    CategoryModule,
    AuthModule,
    NotificationModule,
    SleepModule,
    StudyModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
