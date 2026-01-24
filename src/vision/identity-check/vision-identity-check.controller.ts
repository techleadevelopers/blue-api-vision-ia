import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { VisionIdentityCheckService } from './vision-identity-check.service';
import type {
  IdentityCheckRequestDto,
  IdentityCheckResponseDto,
} from './dto/identity-check.dto';

@Controller('vision/identity-check')
export class VisionIdentityCheckController {
  constructor(private readonly identityService: VisionIdentityCheckService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  check(@Body() payload: IdentityCheckRequestDto): IdentityCheckResponseDto {
    return this.identityService.check(payload);
  }
}
