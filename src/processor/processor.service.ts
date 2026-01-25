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
    // Inicializa o Cloudinary com as credenciais validadas
    cloudinary.config({
      cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
      api_key: ENV.CLOUDINARY.API_KEY,
      api_secret: ENV.CLOUDINARY.API_SECRET,
    });
  }

  /**
   * Pipeline Premium: Remove o fundo original e aplica o cenário "Studio Soft" clean.
   *
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Premium');

    try {
      // 1. Remoção de Fundo via Remove.bg para garantir recorte limpo
      const bgRemovedBuffer = await this.removeBackground(buffer);

      // 2. Composição com o cenário estático clean via Cloudinary
      const processedUrl = await this.applyStudioBackground(bgRemovedBuffer);

      // 3. Download da imagem final tratada
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Imagem processada com sucesso no padrão Studio Soft');
      
      return {
        buffer: Buffer.from(finalResponse.data),
        mimeType: 'image/jpeg', // JPEG para melhor performance mobile
      };
    } catch (error: any) {
      this.logger.error(`Falha no pipeline IA: ${error.message}`);
      // Fallback seguro para não interromper o cadastro do prestador
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
            // Foca no rosto para garantir enquadramento de perfil
            { width: 800, height: 800, crop: 'thumb', gravity: 'face' },
            
            // Aplica o fundo clean de cortina/armário (ID: bg_studio_limpeja_fyrsgu)
            { underlay: 'bg_studio_limpeja_fyrsgu' },
            
            // Ajusta a sobreposição e suaviza bordas para evitar aspecto de "IA fake"
            { width: 800, height: 800, crop: 'fill', flags: 'layer_apply' },
            
            // Otimização de entrega
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