import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  IdentityCheckRequestDto,
  IdentityCheckResponseDto,
  FaceComparisonResult,
} from './dto/identity-check.dto';

@Injectable()
export class VisionIdentityCheckService {
  private readonly logger = new Logger(VisionIdentityCheckService.name);

  async check(payload: IdentityCheckRequestDto): Promise<IdentityCheckResponseDto> {
    const selfie = this.toBuffer(payload.selfieBuffer);
    const document = this.toBuffer(payload.documentBuffer);

    const faceScore = this.compareFaces(selfie, document);
    const faceMatch = faceScore >= 0.75;
    const isLive = this.evaluateLiveness(payload.metadata);
    const faceDetails = this.describeFaceMatch(faceScore, faceMatch);
    const details = isLive ? 'Liveness confirmed' : 'Liveness could not be confirmed';
    const overallScore = Number(
      Math.max(0, Math.min(1, faceScore * (isLive ? 1 : 0.85))).toFixed(2),
    );

    const faceComparison: FaceComparisonResult = {
      match: faceMatch,
      score: faceScore,
      details: faceDetails,
    };

    this.logger.log(
      `Identity check result score=${overallScore} isLive=${isLive} faceMatch=${faceMatch}`,
    );

    return {
      isLive,
      score: overallScore,
      details,
      faceComparison,
    };
  }

  private compareFaces(selfie: Buffer, document: Buffer): number {
    const selfieHash = this.hash(selfie);
    const documentHash = this.hash(document);
    let distance = 0;
    for (let i = 0; i < selfieHash.length; i++) {
      distance += Math.abs(selfieHash[i] - documentHash[i]);
    }

    const normalized = 1 - distance / (selfieHash.length * 255);
    return Number(Math.max(0, Math.min(1, normalized)).toFixed(2));
  }

  private hash(buffer: Buffer): Buffer {
    return createHash('sha256').update(buffer).digest();
  }

  private describeFaceMatch(score: number, match: boolean): string {
    if (match) return `Face similarity is ${score * 100}%`;
    return `Face difference is ${(1 - score) * 100}%`;
  }

  private evaluateLiveness(metadata?: IdentityCheckRequestDto['metadata']): boolean {
    if (!metadata) return true;
    if (metadata.flagged) return false;
    if (metadata.movementDetected === false) return false;
    if (typeof metadata.livenessScore === 'number') {
      return metadata.livenessScore >= 0.65;
    }
    return true;
  }

  private toBuffer(image: string): Buffer {
    const [, payload] = image.split(',');
    return Buffer.from(payload ?? image, 'base64');
  }
}
