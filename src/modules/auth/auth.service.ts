import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { ENV } from '../../config/env.config';
import { URLSearchParams } from 'url';

@Injectable()
export class AuthService {
  buildTikTokAuthUrl() {
    const { TIKTOK_AUTH_URL, TIKTOK_CLIENT_ID, TIKTOK_REDIRECT_URI } = ENV.OAUTH;
    if (!TIKTOK_AUTH_URL || !TIKTOK_CLIENT_ID || !TIKTOK_REDIRECT_URI) {
      throw new InternalServerErrorException('TikTok OAuth not configured');
    }
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_ID,
      response_type: 'code',
      scope: 'user.info.basic,video.list,video.upload',
      redirect_uri: TIKTOK_REDIRECT_URI,
      state: Math.random().toString(36).slice(2),
    });
    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
  }

  async exchangeTikTokCode(code: string, state?: string) {
    const { TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = ENV.OAUTH;
    if (!TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET || !TIKTOK_REDIRECT_URI) {
      throw new InternalServerErrorException('TikTok OAuth not configured');
    }
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_ID,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI,
    });

    try {
      const resp = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return { ...resp.data, state };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `TikTok token exchange failed: ${error?.response?.data?.message || error.message}`,
      );
    }
  }
}
