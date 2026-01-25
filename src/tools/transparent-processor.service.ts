import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { ENV } from '../config/env.config';

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
}

@Injectable()
export class TransparentProcessorService {
  private readonly logger = new Logger(TransparentProcessorService.name);

  /**
   * Pipeline de Remoção Pura: Focado apenas em transparência para Web.
   */
  async process(buffer: Buffer): Promise<ProcessedImage> {
    this.logger.debug('Iniciando remoção de fundo para projeto de transparência');

    try {
      // 1. Chamada direta para a API de remoção de fundo
      const formData = new FormData();
      formData.append('size', 'auto');
      formData.append('image_file', buffer);

      const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': ENV.REMOVE_BG_API_KEY, // Usa a mesma chave que você já tem
        },
        responseType: 'arraybuffer',
      });

      this.logger.log('Fundo removido com sucesso (PNG Transparente)');

      // 2. Retorna o buffer puro em PNG para manter a transparência no site
      return {
        buffer: Buffer.from(response.data),
        mimeType: 'image/png', // Essencial para o site estilo remove.bg
      };
    } catch (error: any) {
      this.logger.error(`Erro no projeto de remoção: ${error.message}`);
      throw new InternalServerErrorException('Falha ao processar transparência da imagem');
    }
  }
}