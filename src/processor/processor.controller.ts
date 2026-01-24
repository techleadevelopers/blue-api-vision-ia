import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcessorService } from './processor.service';
import { UploadService } from '../storage/upload.service';

@Controller('vision')
export class ProcessorController {
  private readonly logger = new Logger(ProcessorController.name);

  constructor(
    private readonly processorService: ProcessorService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('process-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async processAvatar(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`[ProcessorController] Recebida solicitação de processamento para: ${file?.originalname}`);

    if (!file || !file.buffer) {
      throw new BadRequestException('Nenhum arquivo enviado ou buffer inválido.');
    }

    try {
      // 1. Executa a IA (Remove.bg + Cloudinary)
      const processed = await this.processorService.process(file.buffer, file.mimetype);

      // 2. Faz o upload da imagem final tratada para o UploadThing
      const filename = `processed-${Date.now()}-${file.originalname}`;
      const result = await this.uploadService.uploadProcessedFile(
        processed.buffer, 
        filename, 
        processed.mimeType
      );

      this.logger.log(`[ProcessorController] Processamento e upload concluídos: ${result.url}`);
      
      // Retorna apenas a URL final, exatamente como o backend principal espera
      return { url: result.url };
    } catch (error) {
      this.logger.error(`[ProcessorController] Erro no pipeline: ${error.message}`);
      throw new BadRequestException('Falha ao processar a imagem premium.');
    }
  }
}