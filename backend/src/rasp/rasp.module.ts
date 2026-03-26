import { Module } from '@nestjs/common';
import { RaspService } from './rasp.service';
import { RaspController } from './rasp.controller';

@Module({
  controllers: [RaspController],
  providers: [RaspService],
  exports: [RaspService],
})
export class RaspModule {}
