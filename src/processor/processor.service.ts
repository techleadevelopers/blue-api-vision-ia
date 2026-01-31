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
   * ===============================
   * 🟦 AVATAR PÚBLICO (VITRINE)
   * Formato 1:1 – Marketplace Premium
   * ===============================
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline AVATAR PÚBLICO (1:1 – vitrine)');

    try {
      const processedUrl = await this.enhancePublicAvatar(buffer);
      const response = await axios.get(processedUrl, { responseType: 'arraybuffer' });

      this.logger.log('Avatar público processado com sucesso (1:1).');

      return {
        buffer: Buffer.from(response.data),
        mimeType: 'image/jpeg',
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline público: ${error.message}`);
      return { buffer, mimeType };
    }
  }

  /**
   * ===============================
   * 🟨 AJUSTE FINO MANUAL (ADMIN)
   * Eleva rosto cortando base
   * ===============================
   */
  async processWithManualAdjustment(
    buffer: Buffer,
    verticalCutPct: number,
  ): Promise<ProcessedImage> {
    this.logger.debug(
      `Ajuste manual: cortando ${verticalCutPct}% da base (admin only)`,
    );

    try {
      const heightScale = (100 - verticalCutPct) / 100;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'provider_avatars_processed',
            transformation: [
              // 1️⃣ Corta base mantendo topo
              {
                height: heightScale,
                width: 1.0,
                crop: 'crop',
                gravity: 'north',
              },

              // 2️⃣ Padroniza 1:1 (avatar público)
              { width: 800, height: 800, crop: 'fill', gravity: 'face' },

              // 3️⃣ Tratamento premium leve
              { effect: 'improve:indoor' },
              { effect: 'gamma:15' },
              { effect: 'vibrance:18' },
              { effect: 'sharpen:60' },

              { fetch_format: 'jpg', quality: 'auto:good' },
            ],
          },
          async (error, result) => {
            if (error) {
              this.logger.error(`Erro Cloudinary (manual): ${error.message}`);
              return reject(error);
            }

            try {
              const response = await axios.get(result!.secure_url, {
                responseType: 'arraybuffer',
              });

              resolve({
                buffer: Buffer.from(response.data),
                mimeType: 'image/jpeg',
              });
            } catch (err) {
              reject(err);
            }
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      this.logger.error(`Erro ajuste manual: ${error.message}`);
      return { buffer, mimeType: 'image/jpeg' };
    }
  }

  /**
   * ===============================
   * 🟦 AVATAR PÚBLICO – PIPELINE
   * ===============================
   */
  private async enhancePublicAvatar(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'provider_avatars_public',
          transformation: [
            /**
             * 1️⃣ Enquadramento profissional
             * - 1:1
             * - Rosto central
             * - Ombros visíveis
             */
            {
              width: 800,
              height: 800,
              crop: 'thumb',
              gravity: 'face',
              zoom: 0.55,
            },

            /**
             * 2️⃣ (Opcional) Fundo controlado
             * 👉 descomenta quando quiser ativar
             */
            // { background: '#f2f6fb', crop: 'pad' },

            /**
             * 3️⃣ Tratamento premium (natural)
             */
            { effect: 'improve:indoor' },
            { effect: 'gamma:15' },
            { effect: 'vibrance:18' },
            { effect: 'sharpen:60' },

            /**
             * 4️⃣ Output final
             */
            { fetch_format: 'jpg', quality: 'auto:good' },
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

  /**
   * ===============================
   * 🟨 IDENTIDADE REAL (3x4 – KYC)
   * Documento / verificação
   * ===============================
   */
  async processIdentity3x4(buffer: Buffer): Promise<ProcessedImage> {
    this.logger.debug('Processando imagem de identidade (3x4)');

    try {
      const url = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'provider_identity',
            transformation: [
              {
                width: 800,
                height: 1000,
                crop: 'thumb',
                gravity: 'face',
                zoom: 0.6,
              },
              { effect: 'improve:indoor' },
              { effect: 'gamma:15' },
              { effect: 'sharpen:60' },
              { fetch_format: 'jpg', quality: 'auto:good' },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!.secure_url);
          },
        );

        uploadStream.end(buffer);
      });

      const response = await axios.get(url, { responseType: 'arraybuffer' });

      return {
        buffer: Buffer.from(response.data),
        mimeType: 'image/jpeg',
      };
    } catch (error: any) {
      this.logger.error(`Erro identidade 3x4: ${error.message}`);
      return { buffer, mimeType: 'image/jpeg' };
    }
  }
}
