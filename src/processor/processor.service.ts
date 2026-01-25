import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
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
   * Pipeline Premium: Remove o fundo original e injeta o cenário Studio LimpeJá.
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Premium');

    try {
      // 1. Remoção de Fundo via Remove.bg para recorte cirúrgico
      const bgRemovedBuffer = await this.removeBackground(buffer);

      // 2. Composição com o novo cenário (bg_studio_limpeja_ndopjs) via Cloudinary
      const processedUrl = await this.applyStudioBackground(bgRemovedBuffer);

      // 3. Download da imagem final tratada
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Avatar "Premiumizado" com sucesso no cenário Studio LimpeJá');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/jpeg',
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline IA: ${error.message}`);
      // Fallback: mantém a foto original se a IA falhar
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

  private async applyStudioBackground(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'provider_avatars_processed',
          transformation: [
            // Foca no rosto para enquadramento perfeito de perfil
            { width: 800, height: 800, crop: 'thumb', gravity: 'face' },
            
            // ✅ AQUI A MÁGICA: Injeta o novo fundo de cortina branca
            { underlay: 'bg_studio_limpeja_ndopjs' },
            
            // Mescla as camadas e suaviza bordas
            { width: 800, height: 800, crop: 'fill', flags: 'layer_apply' },
            
            // Otimização final para Web/Mobile
            { fetch_format: 'jpg', quality: 'auto' }
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