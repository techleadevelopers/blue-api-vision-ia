import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessorModule } from './processor/processor.module';
import { StorageModule } from './storage/storage.module';
import { VisionOcrModule } from './vision/ocr/vision-ocr.module';
import { VisionIdentityCheckModule } from './vision/identity-check/vision-identity-check.module';
import { ClipforgeModule } from './modules/clipforge/clipforge.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StaticController } from './static/static.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      renderPath: '/terms',
      serveRoot: '/terms',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      renderPath: '/privacy',
      serveRoot: '/privacy',
    }),
    ProcessorModule,
    StorageModule,
    VisionOcrModule,
    VisionIdentityCheckModule,
    ClipforgeModule,
    AuthModule,
  ],
  controllers: [AppController, StaticController],
  providers: [AppService],
})
export class AppModule {}
