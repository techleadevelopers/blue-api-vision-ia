import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RenderService {
  private readonly logger = new Logger(RenderService.name);

  async renderVideo(payload: Record<string, unknown>): Promise<{ videoUrl: string }> {
    // TODO: integrar FFmpeg + templates (templates/ folder)
    this.logger.debug(`Mock render video for job payload: ${JSON.stringify(payload)}`);
    return { videoUrl: 'http://localhost/mock-video.mp4' };
  }
}
