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
   * Pipeline Premium: Remove o fundo e aplica o cenário Studio Soft
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Premium');

    try {
      // 1. Remoção de Fundo via Remove.bg (Mantém transparência)
      const bgRemovedBuffer = await this.removeBackground(buffer);

      // 2. Composição com o cenário "Studio Soft" via Cloudinary
      const processedUrl = await this.applyStudioBackground(bgRemovedBuffer);

      // 3. Download da imagem final para o buffer
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Imagem processada com sucesso no padrão Studio Soft');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/jpeg', // JPEG é mais leve para renderização mobile
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline IA: ${error.message}`);
      // Fallback: Devolve a original para não travar o fluxo do usuário
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
          // A mágica acontece aqui: usamos a imagem da cozinha como camada de baixo (underlay)
          transformation: [
            // Foca no rosto e corta em 800x800
            { width: 800, height: 800, crop: 'thumb', gravity: 'face' },
            // Aplica a imagem de fundo que você subiu (bg_studio_limpeja_yimv2f)
            { underlay: 'bg_studio_limpeja_yimv2f' },
            // Ajusta o fundo para preencher o quadrado e suaviza a borda do recorte
            { width: 800, height: 800, crop: 'fill', flags: 'layer_apply' },
            // Otimização final
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