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
import { AppInfoController } from './app-info.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      renderPath: '/terms',
      serveRoot: '/terms',
      exclude: [
        '/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt',
        '/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/',
        '/terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt',
        '/terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/',
        '/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt',
        '/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/',
        '/terms/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt',
        '/terms/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/',
        '/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt',
        '/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/',
        '/terms/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt',
        '/terms/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/',
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      renderPath: '/privacy',
      serveRoot: '/privacy',
      exclude: [
        '/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt',
        '/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/',
        '/terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt',
        '/terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/',
        '/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt',
        '/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/',
        '/terms/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt',
        '/terms/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/',
        '/privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt',
        '/privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/',
        '/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt',
        '/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/',
        '/terms/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt',
        '/terms/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/',
        '/privacy/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt',
        '/privacy/tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/',
      ],
    }),
    ProcessorModule,
    StorageModule,
    VisionOcrModule,
    VisionIdentityCheckModule,
    ClipforgeModule,
    AuthModule,
  ],
  controllers: [AppController, StaticController, AppInfoController],
  providers: [AppService],
})
export class AppModule {}
