import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  private readonly verificationText =
    'tiktok-developers-site-verification=lyuuCaAPpEkg7jvhNZ0m2SZkLJRG7UVW';

  // Rota explícita para verificação do TikTok no caminho raiz
  @Get('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt')
  getTikTokVerification(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  // Suporta barra final que alguns validadores adicionam
  @Get('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt/')
  getTikTokVerificationSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

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
}
