import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get('tiktok')
  async tiktok(@Res() res: Response) {
    const url = this.service.buildTikTokAuthUrl();
    return res.redirect(url);
  }

  @Get('tiktok/callback')
  async tiktokCallback(
    @Query('code') code?: string,
    @Query('state') state?: string,
  ) {
    if (!code) throw new BadRequestException('Missing code');
    return this.service.exchangeTikTokCode(code, state);
  }
}
