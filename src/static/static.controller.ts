import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  private readonly verificationText =
    'tiktok-developers-site-verification=bmZ61saa2BBAvaplPFnhMW8MSI2x0AoG';

  // GET/HEAD root
  @Get(':file(tiktok.*\\.txt)')
  getTikTok(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get(':file(tiktok.*\\.txt)/')
  getTikTokSlash(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head(':file(tiktok.*\\.txt)')
  headTikTok(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head(':file(tiktok.*\\.txt)/')
  headTikTokSlash(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  // GET/HEAD under /terms
  @Get('terms/:file(tiktok.*\\.txt)')
  getTikTokTerms(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get('terms/:file(tiktok.*\\.txt)/')
  getTikTokTermsSlash(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('terms/:file(tiktok.*\\.txt)')
  headTikTokTerms(@Param('file') _file: string, @Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('terms/:file(tiktok.*\\.txt)/')
  headTikTokTermsSlash(@Param('file') _file: string, @Res() res: Response) {
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
