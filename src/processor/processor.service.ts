import { Injectable, Logger } from '@nestjs/common';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Pipeline invoked for premium image processing');

    // TODO: implementar Remove.bg, Cloudinary e outros passos do pipeline real.
    await Promise.resolve();
    return { buffer, mimeType };
  }
}
