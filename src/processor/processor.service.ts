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
   * 1. Ignora o remove.bg para manter a naturalidade (evita o "vale da estranheza").
   * 2. Enquadramento inteligente focado no rosto (Zoom 0.65).
   * 3. Limpeza de iluminação (Auto-Improve) para branquear o fundo real.
   * 4. Harmonização de cores para tom de pele profissional.
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Real Background (Padrão 3x4)');

    try {
      /**
       * 1. Enviamos o buffer original direto para o Cloudinary.
       * Não usamos mais o remove.bg para evitar que a foto pareça "colada".
       */
      const processedUrl = await this.enhanceRealPhoto(buffer);

      // 2. Download da imagem final tratada
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Avatar processado com sucesso: Padrão Real 3x4 aplicado.');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/jpeg',
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline de imagem: ${error.message}`);
      // Fallback: se a IA falhar por qualquer motivo, mantém o original para não travar o cadastro
      return { buffer, mimeType };
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
             * g_face: Centraliza no rosto.
             * zoom: 0.65: Garante que os ombros apareçam, criando o aspecto de crachá corporativo.
             */
            { width: 800, height: 1000, crop: 'thumb', gravity: 'face', zoom: 0.65 },

            /**
             * 2. TRATAMENTO DE LUZ E FUNDO REAL
             * improve:indoor: Detecta a parede branca ao fundo e aumenta a exposição.
             * gamma:20: Remove tons amarelados de luz de lâmpada comum.
             */
            { effect: "improve:indoor" },
            { effect: "gamma:20" },

            /**
             * 3. HARMONIZAÇÃO DE COR
             * warm:10: Dá um tom de saúde para a pele.
             * vibrance:20: Deixa a foto mais "viva" e nítida.
             */
            { effect: "vibrance:20" },
            { effect: "warm:10" },

            /**
             * 4. NITIDEZ E ACABAMENTO
             * e_sharpen: Garante que os olhos e detalhes do rosto fiquem nítidos no app.
             */
            { effect: "sharpen:100" },

            /**
             * 5. FORMATO FINAL
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