import { BadRequestException, Controller, Get, Query, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly service: AuthService) {}

  @Get('tiktok')
  async tiktok(@Res() res: Response) {
    const url = this.service.buildTikTokAuthUrl();
    return res.redirect(url);
  }

  @Get('tiktok/callback')
  async tiktokCallback(@Query() query: Record<string, string>) {
    const code = query.code || query.auth_code;
    const state = query.state || query.oauth_state;

    this.logger.debug(`TikTok callback query: ${JSON.stringify(query)}`);

    if (!code) {
      throw new BadRequestException(
        `Missing code in callback. Received query: ${JSON.stringify(query)}`,
      );
    }
    return this.service.exchangeTikTokCode(code, state);
  }
}
