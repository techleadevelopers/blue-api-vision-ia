import { Module } from '@nestjs/common';
import { ProcessorController } from './processor.controller';
import { ProcessorService } from './processor.service';
import { StorageModule } from '../storage/storage.module'; // Importa o módulo que exporta o UploadService

@Module({
  imports: [StorageModule], // Permite que o ProcessorService use o UploadService
  controllers: [ProcessorController],
  providers: [ProcessorService],
})
export class ProcessorModule {}