import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// CORREÇÃO: Importar como tipo para satisfazer o isolatedModules
import type { Response } from 'express'; 
import { TransparentProcessorService } from './transparent-processor.service';

@Controller('tools')
export class ToolsController {
  constructor(private readonly processorService: TransparentProcessorService) {}

  @Post('remove-bg')
  @UseInterceptors(FileInterceptor('image'))
  async removeBackground(
    @UploadedFile() file: Express.Multer.File,
    // O uso do @Res() impede o Nest de gerenciar a resposta automaticamente, 
    // permitindo o uso do res.end() para o download direto.
    @Res() res: Response, 
  ) {
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada.');
    }

    try {
      // 1. Processa a remoção de fundo pura (sem cenário premium)
      const processed = await this.processorService.process(file.buffer);

      // 2. Configura os headers para download do PNG transparente
      res.set({
        'Content-Type': processed.mimeType,
        'Content-Disposition': `attachment; filename="limpeja-removed-${Date.now()}.png"`,
        'Content-Length': processed.buffer.length,
      });

      // 3. Envia o buffer diretamente para o navegador do usuário (mais rápido para downloads)
      return res.end(processed.buffer);

    } catch (error: any) {
      throw new BadRequestException('Falha ao processar a remoção de fundo.');
    }
  }
}