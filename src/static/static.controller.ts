import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  @Get('terms')
  getTerms(@Res() res: Response) {
    return res.sendFile(join(__dirname, 'static', 'terms.html'));
  }

  @Get('privacy')
  getPrivacy(@Res() res: Response) {
    return res.sendFile(join(__dirname, 'static', 'privacy.html'));
  }
}
