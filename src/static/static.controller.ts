import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  @Get('terms')
  getTerms(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', 'terms.html'));
  }

  @Get('privacy')
  getPrivacy(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', 'privacy.html'));
  }

  @Get('terms/:file')
  getTermsFile(@Param('file') file: string, @Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', file));
  }

  // Rota explícita para verificação do TikTok no caminho raiz
  @Get('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt')
  getTikTokVerification(@Res() res: Response) {
    // Responde inline para evitar dependência de arquivo no build
    res.type('text/plain');
    return res.send(
      'tiktok-developers-site-verification=9DJJtMAHBJYGN75iA8AnT163uOLbWa7f',
    );
  }
}
