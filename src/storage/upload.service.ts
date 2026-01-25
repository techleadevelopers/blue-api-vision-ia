import { Injectable, HttpException, Logger } from '@nestjs/common';
import { UTApi, UTFile } from 'uploadthing/server';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  // Garanta que o token no Railway não tenha aspas extras
  private readonly utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

  async uploadProcessedFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<{ url: string }> {
    try {
      this.logger.log(`[Vision-Upload] Enviando para UploadThing: ${filename}`);

      const fileData = new Uint8Array(buffer);
      const utFile = new UTFile([fileData], filename, {
        type: contentType,
      });

      // O retorno do uploadFiles mudou na v7+
      const response = await this.utapi.uploadFiles(utFile);
      
      // O UploadThing retorna um array mesmo para arquivo único
      const result = Array.isArray(response) ? response[0] : response;

      if (!result || result.error) {
        const errorMsg = result?.error?.message || 'Erro desconhecido no UploadThing';
        throw new Error(errorMsg);
      }

      // CORREÇÃO CRÍTICA: Usar ufsUrl conforme o log de depreciação sugeriu
      const url = result.data?.ufsUrl;

      if (!url) {
        // Fallback manual caso a rede ufs demore a propagar
        const fallbackUrl = result.data?.key ? `https://utfs.io/f/${result.data.key}` : undefined;
        if (!fallbackUrl) throw new Error('Falha ao obter URL final (ufsUrl/key undefined)');
        
        this.logger.warn(`[Vision-Upload] ufsUrl não disponível, usando fallback por key.`);
        return { url: fallbackUrl };
      }

      this.logger.log(`[Vision-Upload] Upload concluído com sucesso: ${url}`);
      return { url };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error('Erro no upload final do Vision-IA', message);
      throw new HttpException('Erro ao salvar imagem processada', 500);
    }
  }
}