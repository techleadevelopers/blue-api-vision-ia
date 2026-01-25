import { Injectable, HttpException, Logger } from '@nestjs/common';
import { UTApi, UTFile } from 'uploadthing/server';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  
  // Certifique-se de que o token no Railway não tenha aspas (") ou barras (\) extras
  private readonly utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

  async uploadProcessedFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<{ url: string }> {
    try {
      this.logger.log(`[Vision-Upload] Enviando para UploadThing: ${filename}`);

      // Converte o buffer para o formato aceito pelo UTFile
      const fileData = new Uint8Array(buffer);
      const utFile = new UTFile([fileData], filename, {
        type: contentType,
      });

      // Realiza o upload
      const result = await this.utapi.uploadFiles(utFile);
      
      // A resposta do UploadThing v7+ vem em um array de objetos { data, error }
      const uploadResults = Array.isArray(result) ? result : [result];
      const firstResult = uploadResults[0];

      if (!firstResult || firstResult.error) {
        const errorMsg = firstResult?.error?.message || 'Erro desconhecido no UploadThing';
        throw new Error(errorMsg);
      }

      // IMPORTANTE: Use ufsUrl conforme sugerido nos logs de depreciação
      // Fallback para montar a URL manualmente caso o campo novo não venha
      const url = firstResult.data?.ufsUrl || 
                  (firstResult.data?.key ? `https://utfs.io/f/${firstResult.data.key}` : undefined);

      if (!url) {
        throw new Error('Falha ao obter URL do UploadThing (data.ufsUrl é undefined)');
      }

      this.logger.log(`[Vision-Upload] Sucesso! URL obtida: ${url}`);
      return { url };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro no upload final do Vision-IA', message);
      throw new HttpException('Erro ao salvar imagem processada', 500);
    }
  }
}