import { Injectable, Logger } from '@nestjs/common';
import { ENV } from '../../../config/env.config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClipforgeStorageService {
  private readonly logger = new Logger(ClipforgeStorageService.name);

  async saveFile(buffer: Buffer, filename: string): Promise<{ url: string }> {
    if (ENV.STORAGE.DRIVER === 'local') {
      const folder = path.join(process.cwd(), 'dist', 'clipforge-assets');
      fs.mkdirSync(folder, { recursive: true });
      const target = path.join(folder, filename);
      fs.writeFileSync(target, buffer);
      return { url: `file://${target}` };
    }

    // TODO: opcionalmente integrar UploadThing/S3/R2 reutilizando variáveis do ENV.STORAGE
    this.logger.warn('Remote storage not configured; returning mock URL');
    return { url: `mock://${filename}` };
  }
}
