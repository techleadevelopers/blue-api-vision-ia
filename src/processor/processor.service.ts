import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.config'; // Garante o uso das suas chaves

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class ProcessorService {
  private readonly logger = new Logger(ProcessorService.name);

  constructor() {
    // Configura o Cloudinary com suas credenciais do env.config.ts
    cloudinary.config({
      cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
      api_key: ENV.CLOUDINARY.API_KEY,
      api_secret: ENV.CLOUDINARY.API_SECRET,
    });
  }

  /**
   * Pipeline Premium: Remove fundo original e aplica o padrão Limpe Já (#F1F2F2)
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Premium');

    try {
      // 1. Remoção de Fundo via Remove.bg
      const bgRemovedBuffer = await this.removeBackground(buffer);

      // 2. Composição de fundo cinza padrão via Cloudinary (#F1F2F2)
      const processedUrl = await this.applyBrandBackground(bgRemovedBuffer);

      // 3. Download da imagem final tratada para o buffer de upload
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Imagem processada com sucesso no padrão Premium');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/png', // PNG mantém a qualidade do tratamento
      };
    } catch (error) {
      this.logger.error(`Falha no pipeline IA: ${error.message}`);
      // Fallback: Devolve a original para não travar o cadastro da Luciene
      return { buffer, mimeType };
    }
  }

  private async removeBackground(buffer: Buffer): Promise<Buffer> {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', buffer);

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': ENV.REMOVE_BG_API_KEY, 
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  private async applyBrandBackground(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'provider_avatars_processed',
          background: 'rgb:F1F2F2', // Aplica o cinza padrão do app
          transformation: [
            { width: 600, height: 600, crop: 'thumb', gravity: 'face' }, // Foca no rosto
            { fetch_format: 'jpg', quality: 'auto' } // Otimiza para o mobile
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