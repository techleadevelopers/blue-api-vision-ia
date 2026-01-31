import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  private readonly verificationText =
    'tiktok-developers-site-verification=lyuuCaAPpEkg7jvhNZ0m2SZkLJRG7UVW';
  private readonly verificationPath = 'tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt';

  @Get('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt')
  getTikTokVerification(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Get('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt/')
  getTikTokVerificationSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt')
  headTikTokVerification(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationText);
  }

  @Head('tiktok9DJJtMAHBJYGN75iA8AnT163uOLbWa7f.txt/')
  headTikTokVerificationSlash(@Res() res: Response) {
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
