import { Controller, Get } from '@nestjs/common';
import { APP_DESCRIPTION_FULL, APP_DESCRIPTION_NO_UPLOAD } from './config/app.info';

@Controller('app')
export class AppInfoController {
  @Get('info')
  getInfo() {
    return {
      description: APP_DESCRIPTION_FULL,
      description_no_upload: APP_DESCRIPTION_NO_UPLOAD,
    };
  }
}
