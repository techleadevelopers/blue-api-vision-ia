import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
  Body,
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

  /**
   * Rota Automática: Processa a foto seguindo o padrão 3x4 real.
   */
  @Post('process-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async processAvatar(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(
      `[ProcessorController] Processamento automático iniciado: ${file?.originalname}`,
    );

    if (!file || !file.buffer) {
      throw new BadRequestException('Nenhum arquivo enviado ou buffer inválido.');
    }

    try {
      const processed = await this.processorService.process(
        file.buffer,
        file.mimetype,
      );

      const filename = `processed-${Date.now()}-${file.originalname || 'avatar.png'}`;
      const result = await this.uploadService.uploadProcessedFile(
        processed.buffer,
        filename,
        processed.mimeType,
      );

      return { url: result.url };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[ProcessorController] Erro no pipeline automático: ${message}`);
      throw new BadRequestException('Falha ao processar a imagem.');
    }
  }

  /**
   * Rota de Ajuste Manual: Corta a porcentagem da base para elevar o rosto.
   * Útil para fotos onde a prestadora ficou muito longe da câmera.
   */
  @Post('manual-adjust')
  @UseInterceptors(FileInterceptor('file'))
  async manualAdjust(
    @UploadedFile() file: Express.Multer.File,
    @Body('vertical_cut_pct') verticalCutPct: string,
  ) {
    // Converte para número e define 10% como padrão se não for enviado
    const cutValue = parseInt(verticalCutPct, 10) || 10;

    this.logger.log(
      `[ProcessorController] Ajuste manual solicitado: Corte de ${cutValue}% na base para ${file?.originalname}`,
    );

    if (!file || !file.buffer) {
      throw new BadRequestException('Buffer inválido para ajuste manual.');
    }

    try {
      // Chama a nova função de crop vertical no Service
      const processed = await this.processorService.processWithManualAdjustment(
        file.buffer,
        cutValue,
      );

      const filename = `adjusted-${Date.now()}-${file.originalname || 'avatar.png'}`;
      const result = await this.uploadService.uploadProcessedFile(
        processed.buffer,
        filename,
        processed.mimeType,
      );

      this.logger.log(`[ProcessorController] Ajuste manual concluído: ${result.url}`);

      return { 
        url: result.url,
        adjustment_applied: `${cutValue}%`
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`[ProcessorController] Erro no ajuste manual: ${message}`);
      throw new BadRequestException('Falha ao aplicar ajuste vertical manual.');
    }
  }
}