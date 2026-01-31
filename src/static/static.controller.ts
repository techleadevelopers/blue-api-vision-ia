import { Controller, Get, Head, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class StaticController {
  // Token já verificado (terms)
  private readonly verificationTextOld =
    'tiktok-developers-site-verification=bmZ61saa2BBAvaplPFnhMW8MSI2x0AoG';
  private readonly verificationFileOld = 'tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt';

  // Novo token gerado para /privacy
  private readonly verificationTextNew =
    'tiktok-developers-site-verification=psVcMW2vkFEm3rVco3YeAU8iJxOQXDK2';
  private readonly verificationFileNew = 'tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt';

  // Token para domínio raíz (Web/Desktop URL)
  private readonly verificationTextRoot =
    'tiktok-developers-site-verification=vE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ';
  private readonly verificationFileRoot = 'tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt';

  // Root - explicit paths (GET/HEAD) with and without trailing slash
  @Get('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  getTikTok(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Get('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  getTikTokSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Head('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  headTikTok(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Head('tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  headTikTokSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  // Novo token na raiz (Web/Desktop URL)
  @Get('tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt')
  getTikTokRoot(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextRoot);
  }

  @Get('tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/')
  getTikTokRootSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextRoot);
  }

  @Head('tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt')
  headTikTokRoot(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextRoot);
  }

  @Head('tiktokvE1f4utB3twK8PgE0ZmVaJTVXjuNFbxQ.txt/')
  headTikTokRootSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextRoot);
  }

  // Novo token na raiz
  @Get('tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt')
  getTikTokNew(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Get('tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/')
  getTikTokNewSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Head('tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt')
  headTikTokNew(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Head('tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/')
  headTikTokNewSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  // Under /terms - explicit paths
  @Get('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  getTikTokTerms(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Get('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  getTikTokTermsSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Head('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt')
  headTikTokTerms(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  @Head('terms/tiktokbmZ61saa2BBAvaplPFnhMW8MSI2x0AoG.txt/')
  headTikTokTermsSlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextOld);
  }

  // Novo token em /privacy (prefixo usado na verificação nova)
  @Get('privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt')
  getTikTokPrivacy(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Get('privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/')
  getTikTokPrivacySlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Head('privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt')
  headTikTokPrivacy(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Head('privacy/tiktokpsVcMW2vkFEm3rVco3YeAU8iJxOQXDK2.txt/')
  headTikTokPrivacySlash(@Res() res: Response) {
    res.type('text/plain');
    return res.send(this.verificationTextNew);
  }

  @Get('terms')
  getTerms(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', 'terms.html'));
  }

  @Get('privacy')
  getPrivacy(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', 'privacy.html'));
  }

  @Get('terms/:file')
  getTermsFile(@Param('file') file: string, @Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'static', file));
  }
}
