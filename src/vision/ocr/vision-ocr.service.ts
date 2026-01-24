import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { DocumentOcrRequestDto, DocumentOcrResponseDto } from './dto/document-ocr.dto';

@Injectable()
export class VisionOcrService {
  private readonly logger = new Logger(VisionOcrService.name);

  async extractFromDocument(body: DocumentOcrRequestDto): Promise<DocumentOcrResponseDto> {
    const buffer = this.toBuffer(body.buffer);
    try {
      const { text, confidence, rawResult } = await this.recognizeText(buffer);
      return {
        extractedText: text,
        confidence,
        rawResult,
      };
    } catch (error) {
      this.logger.error('Erro ao interpretar o documento', error);
      throw new InternalServerErrorException('Nao foi possivel extrair os dados do documento');
    }
  }

  private async recognizeText(buffer: Buffer): Promise<{
    text: string;
    confidence: number;
    rawResult: any;
  }> {
    const worker = await createWorker({
      logger: ({ status, progress }) =>
        this.logger.debug(`OCR ${status} ${Math.round((progress ?? 0) * 100)}%`),
    });

    try {
      await worker.load();
      await worker.loadLanguage('por');
      await worker.initialize('por');
      const { data } = await worker.recognize(buffer);
      const confidence = this.normalizeConfidence(data.confidence ?? 0);
      return {
        text: (data.text ?? '').trim(),
        confidence,
        rawResult: data,
      };
    } finally {
      await worker.terminate();
    }
  }

  private normalizeConfidence(value: number): number {
    const normalized = value / 100;
    return Number(Math.max(0, Math.min(1, normalized)).toFixed(2));
  }

  private toBuffer(image: string): Buffer {
    const [, payload] = image.split(',');
    return Buffer.from(payload ?? image, 'base64');
  }
}
