import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  private readonly verificationText =
    'tiktok-developers-site-verification=bmZ61saa2BBAvaplPFnhMW8MSI2x0AoG';

  // Atende qualquer arquivo tiktok*.txt (com ou sem barra final) em GET/HEAD
  @Get(':file(tiktok.*\\.txt)')
  getTikTokVerification(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get(':file(tiktok.*\\.txt)/')
  getTikTokVerificationSlash(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head(':file(tiktok.*\\.txt)')
  headTikTokVerification(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head(':file(tiktok.*\\.txt)/')
  headTikTokVerificationSlash(@Param('file') _file: string, @Res() res: Response) {
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
