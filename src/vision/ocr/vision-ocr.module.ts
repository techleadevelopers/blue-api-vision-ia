import { Module } from '@nestjs/common';
import { VisionOcrController } from './vision-ocr.controller';
import { VisionOcrService } from './vision-ocr.service';

@Module({
  controllers: [VisionOcrController],
  providers: [VisionOcrService],
})
export class VisionOcrModule {}
