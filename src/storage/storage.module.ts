import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from '../upload/upload.controller';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService], // IMPORTANTE: Para o ProcessorService conseguir usar
})
export class StorageModule {}
