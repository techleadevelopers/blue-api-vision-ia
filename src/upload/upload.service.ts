import { Injectable, HttpException, Logger } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

  async uploadProcessedFile(buffer: Buffer, filename: string, contentType: string) {
    try {
      this.logger.log(`[Vision-Upload] Enviando para UploadThing: ${filename}`);
      
      const blob = new Blob([new Uint8Array(buffer)], { type: contentType }) as any;
      blob.name = filename;
      blob.lastModified = Date.now();

      const result = await this.utapi.uploadFiles(blob);
      const data = (result as any)?.data;
      const file = Array.isArray(data) ? data[0] : data;
      const url = file?.url || (file?.key ? `https://utfs.io/f/${file.key}` : undefined);

      if (!url) throw new Error('Falha ao obter URL do UploadThing');

      return { url };
    } catch (error) {
      this.logger.error('Erro no upload final do Vision-IA', error);
      throw new HttpException('Erro ao salvar imagem processada', 500);
    }
  }
}