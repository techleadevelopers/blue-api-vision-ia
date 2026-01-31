import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  private readonly verificationText =
    'tiktok-developers-site-verification=bmZ61saa2BBAvaplPFnhMW8MSI2x0AoG';
  private readonly verificationFile = 'tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt';

  // Root - explicit paths (GET/HEAD) with and without trailing slash
  @Get('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  getTikTok(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  getTikTokSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  headTikTok(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  headTikTokSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  // Under /terms - explicit paths
  @Get('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  getTikTokTerms(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  getTikTokTermsSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  headTikTokTerms(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  headTikTokTermsSlash(@Res() res: Response) {
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
