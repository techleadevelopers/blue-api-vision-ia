import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessorModule } from './processor/processor.module';
import { StorageModule } from './storage/storage.module';
import { VisionOcrModule } from './vision/ocr/vision-ocr.module';
import { VisionIdentityCheckModule } from './vision/identity-check/vision-identity-check.module';
import { ClipforgeModule } from './modules/clipforge/clipforge.module';

@Module({
  imports: [
    ProcessorModule,
    StorageModule,
    VisionOcrModule,
    VisionIdentityCheckModule,
    ClipforgeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
