import { Module } from '@nestjs/common';
import { DayService } from './day.service';
import { DayController } from './day.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Day } from './entities/day.entity';

@Module({
  controllers: [DayController],
  providers: [DayService],
  imports: [
    TypeOrmModule.forFeature([Day])
  ]
})
export class DayModule {}
