import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
  imports: [HttpModule],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
