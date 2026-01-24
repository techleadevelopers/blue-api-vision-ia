import { Controller, Get } from '@nestjs/common';

@Controller('upload')
export class UploadController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
