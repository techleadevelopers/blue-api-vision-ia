import { Module } from '@nestjs/common';
import { VisionIdentityCheckController } from './vision-identity-check.controller';
import { VisionIdentityCheckService } from './vision-identity-check.service';

@Module({
  controllers: [VisionIdentityCheckController],
  providers: [VisionIdentityCheckService],
})
export class VisionIdentityCheckModule {}
