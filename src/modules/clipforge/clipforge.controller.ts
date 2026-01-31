import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ClipforgeService, GenerateRequestDto } from './clipforge.service';
import { CLIPFORGE_QUEUES, ClipforgeQueueName } from './queues/clipforge.queues';
import { ENV } from '../../config/env.config';

@Controller('api')
export class ClipforgeController {
  constructor(private readonly service: ClipforgeService) {}

  @Post('generate')
  generate(@Body() body: GenerateRequestDto) {
    this.ensureAdmin(body.adminToken);
    return this.service.generate(body);
  }

  @Post('jobs/:id/retry')
  retry(
    @Param('id') id: string,
    @Headers('x-admin-token') admin: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.retryJob(id);
  }

  @Post('jobs/:id/cancel')
  cancel(
    @Param('id') id: string,
    @Headers('x-admin-token') admin: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.cancelJob(id);
  }

  @Get('queues')
  listQueues(@Headers('x-admin-token') admin: string) {
    this.ensureAdmin(admin);
    return this.service.listQueues();
  }

  @Post('queues/:name/pause')
  pauseQueue(
    @Param('name') name: ClipforgeQueueName,
    @Headers('x-admin-token') admin: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.pauseQueue(name);
  }

  @Post('queues/:name/resume')
  resumeQueue(
    @Param('name') name: ClipforgeQueueName,
    @Headers('x-admin-token') admin: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.resumeQueue(name);
  }

  @Get('jobs')
  listJobs(
    @Query('queue') queue?: ClipforgeQueueName,
    @Query('status') status?: string,
    @Headers('x-admin-token') admin?: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.listJobs({ queue, status: status as any });
  }

  @Get('accounts')
  listAccounts(@Headers('x-admin-token') admin: string) {
    this.ensureAdmin(admin);
    return this.service.listAccounts();
  }

  @Get('posts')
  listPosts(
    @Query('accountId') accountId?: string,
    @Query('range') range?: string,
    @Headers('x-admin-token') admin?: string,
  ) {
    this.ensureAdmin(admin);
    const rangeDays = range ? Number(range.replace('d', '')) : undefined;
    return this.service.listPosts(accountId, rangeDays);
  }

  @Get('insights')
  listInsights(
    @Query('range') range?: string,
    @Headers('x-admin-token') admin?: string,
  ) {
    this.ensureAdmin(admin);
    const rangeDays = range ? Number(range.replace('d', '')) : undefined;
    return this.service.listInsights(rangeDays);
  }

  @Get('themes')
  listThemes(@Headers('x-admin-token') admin?: string) {
    this.ensureAdmin(admin);
    return this.service.listThemes();
  }

  @Put('themes/:id')
  updateTheme(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @Headers('x-admin-token') admin?: string,
  ) {
    this.ensureAdmin(admin);
    return this.service.updateTheme(id, data);
  }

  private ensureAdmin(adminToken?: string) {
    if (!ENV.ADMIN_TOKEN) return;
    const cleaned = adminToken?.replace('Bearer ', '');
    if (cleaned !== ENV.ADMIN_TOKEN) {
      throw new UnauthorizedException('Invalid admin token');
    }
  }
}
