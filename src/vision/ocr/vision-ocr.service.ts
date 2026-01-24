import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import {
  DocumentOcrRequestDto,
  DocumentOcrResponseDto,
} from './dto/document-ocr.dto';

@Injectable()
export class VisionOcrService {
  private readonly logger = new Logger(VisionOcrService.name);

  async extractFromDocument(
    body: DocumentOcrRequestDto,
  ): Promise<DocumentOcrResponseDto> {
    const buffer = this.toBuffer(body.buffer);
    try {
      const ocrResult = await this.recognizeText(buffer);
      return {
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence,
        rawResult: ocrResult.rawResult,
      };
    } catch (error) {
      this.logger.error('Erro ao interpretar o documento', error);
      throw new InternalServerErrorException(
        'Nao foi possivel extrair os dados do documento',
      );
    }
  }

  private async recognizeText(buffer: Buffer): Promise<{
    text: string;
    confidence: number;
    rawResult: unknown;
  }> {
    type CreateWorkerOptions = Parameters<typeof createWorker>[2];
    type LoggerPayload = { status: string; progress?: number };
    type ExtendedWorker = Awaited<ReturnType<typeof createWorker>> & {
      loadLanguage(lang: string): Promise<void>;
      initialize(lang: string): Promise<void>;
    };

    const worker = (await createWorker([], undefined, {
      logger: ({ status, progress }: LoggerPayload) =>
        this.logger.debug(
          `OCR ${status} ${Math.round((progress ?? 0) * 100)}%`,
        ),
    } as CreateWorkerOptions)) as ExtendedWorker;

    try {
      await worker.load();
      await worker.loadLanguage('por');
      await worker.initialize('por');
      const recognizeResult = await worker.recognize(buffer);
      const { data } = recognizeResult;
      const confidence = this.normalizeConfidence(
        (data as { confidence?: number }).confidence ?? 0,
      );
      return {
        text: ((data as { text?: string }).text ?? '').trim(),
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
