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
   * Pipeline Premium: 
   * 1. Remove fundo.
   * 2. Normaliza brilho/contraste.
   * 3. Harmoniza temperatura de cor.
   * 4. Enquadramento inteligente (Face Crop 40%).
   * 5. Injeta cenário Studio.
   */
  async process(buffer: Buffer, mimeType: string): Promise<ProcessedImage> {
    this.logger.debug('Iniciando pipeline de processamento Premium com IA de Imagem');

    try {
      // 1. Remoção de Fundo via Remove.bg para recorte cirúrgico
      const bgRemovedBuffer = await this.removeBackground(buffer);

      // 2. Composição, Enquadramento e Tratamento de Luz via Cloudinary
      const processedUrl = await this.applyStudioBackground(bgRemovedBuffer);

      // 3. Download da imagem final tratada
      const finalResponse = await axios.get(processedUrl, { responseType: 'arraybuffer' });
      
      this.logger.log('Avatar "Premiumizado" e Harmonizado com sucesso no cenário Studio LimpeJá');
      
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
            /**
             * 1. ENQUADRAMENTO INTELIGENTE (Face Crop)
             * g_face: foca no rosto. 
             * zoom: 0.65 afasta a "câmera" para que o rosto ocupe aprox. 40% da área, 
             * resolvendo o problema de fotos muito perto (Luciene).
             */
            { width: 800, height: 800, crop: 'thumb', gravity: 'face', zoom: 0.65 },

            /**
             * 2. NORMALIZAÇÃO DE LUZ (Auto-Improve)
             * improve: ajusta automaticamente brilho e contraste.
             * gamma:20: clareia sombras de fotos escuras (Mariana).
             */
            { effect: "improve:indoor" },
            { effect: "gamma:20" },

            /**
             * 3. HARMONIZAÇÃO DE CORES
             * warm:10: dá um tom levemente aquecido para todas as peles.
             * vibrance:20: deixa as cores mais vivas sem estourar.
             */
            { effect: "vibrance:20" },
            { effect: "warm:10" },

            /**
             * 4. INJEÇÃO DO CENÁRIO STUDIO
             * underlay: coloca o fundo de cortina branca por trás do recorte.
             */
            { underlay: 'bg_studio_limpeja_ndopjs' },
            
            // Mescla as camadas e garante o preenchimento final
            { width: 800, height: 800, crop: 'fill', flags: 'layer_apply' },

            /**
             * 5. OTIMIZAÇÃO FINAL
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