import { Injectable, HttpException, Logger } from '@nestjs/common';
import { UTApi, UTFile } from 'uploadthing/server';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

  async uploadProcessedFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<{ url: string }> {
    try {
      this.logger.log(`[Vision-Upload] Enviando para UploadThing: ${filename}`);

      const data = new Uint8Array(buffer);
      const utFile = new UTFile([data], filename, {
        type: contentType,
        lastModified: Date.now(),
      });

      const result = await this.utapi.uploadFiles(utFile);
      const uploadResults = Array.isArray(result) ? result : [result];
      type UploadResult = { url?: string; key?: string };
      const file =
        uploadResults[0] == null
          ? undefined
          : (uploadResults[0] as unknown as UploadResult);
      const url =
        file?.url || (file?.key ? `https://utfs.io/f/${file.key}` : undefined);

      if (!url) throw new Error('Falha ao obter URL do UploadThing');

      return { url };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro no upload final do Vision-IA', message);
      throw new HttpException('Erro ao salvar imagem processada', 500);
    }
  }
}
