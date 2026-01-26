import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.config';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  constructor() {
    cloudinary.config({
      cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
      api_key: ENV.CLOUDINARY.API_KEY,
      api_secret: ENV.CLOUDINARY.API_SECRET,
    });
  }

  /**
   * Pipeline Identidade Real (Padrão 3x4):
   * Fluxo automático para novos cadastros.
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Real Background (Padrão 3x4)');

    try {
      const processedUrl = await this.enhanceRealPhoto(buffer);

      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Avatar processado com sucesso: Padrão Real 3x4 aplicado.');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/jpeg',
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline de imagem: ${error.message}`);
      return { buffer, mimeType };
    }
  }

  /**
   * Ajuste Fino Manual:
   * Remove uma porcentagem da base para elevar o posicionamento do rosto no card.
   * Ideal para fotos tiradas de muito longe.
   */
  async processWithManualAdjustment(buffer: Buffer, verticalCutPct: number): Promise<ProcessedImage> {
    this.logger.debug(`Executando ajuste manual: Cortando ${verticalCutPct}% da base para elevar o rosto.`);

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'provider_avatars_processed',
            transformation: [
              /**
               * 1. CORTA A BASE (Vertical Crop)
               * Removemos a porcentagem da parte de baixo para forçar o enquadramento a subir.
               * gravity: 'north' garante que o corte comece de baixo para cima.
               */
              { 
                height: `${100 - verticalCutPct}`, 
                width: "1.0", 
                crop: "crop", 
                gravity: "north" 
              },

              // 2. PADRONIZAÇÃO 3x4 FINAL
              { width: 800, height: 1000, crop: "fill" },

              // 3. TRATAMENTO DE IMAGEM (Mantém o padrão visual)
              { effect: "improve:indoor" },
              { effect: "gamma:20" },
              { effect: "warm:10" },
              { effect: "sharpen:100" },
              { fetch_format: 'jpg', quality: 'auto:good' }
            ],
          },
          async (error, result) => {
            if (error) return reject(error);
            
            const response = await axios.get(result!.secure_url, { responseType: 'arraybuffer' });
            resolve({
              buffer: Buffer.from(response.data),
              mimeType: 'image/jpeg',
            });
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      this.logger.error(`Erro no ajuste manual: ${error.message}`);
      return { buffer, mimeType: 'image/jpeg' };
    }
  }

  private async enhanceRealPhoto(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'provider_avatars_processed',
          transformation: [
            /**
             * 1. ENQUADRAMENTO PROFISSIONAL (3x4)
             * zoom: 0.65 garante os ombros no enquadramento.
             */
            { width: 800, height: 1000, crop: 'thumb', gravity: 'face', zoom: 0.65 },

            /**
             * 2. TRATAMENTO DE LUZ E COR
             */
            { effect: "improve:indoor" },
            { effect: "gamma:20" },
            { effect: "vibrance:20" },
            { effect: "warm:10" },
            { effect: "sharpen:100" },

            /**
             * 3. FORMATO FINAL
             */
            { fetch_format: 'jpg', quality: 'auto:good' }
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        },
      );

      uploadStream.end(imageBuffer);
    });
  }
}