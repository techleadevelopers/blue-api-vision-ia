export interface IdentityCheckRequestDto {
  /**
   * Base64 buffer for the captured selfie.
   */
  selfieBuffer: string;

  /**
   * Base64 buffer for the document portrait where the identity should match.
   */
  documentBuffer: string;

  metadata?: {
    movementDetected?: boolean;
    livenessScore?: number;
    flagged?: boolean;
  };
}

export interface FaceComparisonResult {
  match: boolean;
  score: number;
  details?: string;
}

export interface IdentityCheckResponseDto {
  isLive: boolean;
  score: number;
  details?: string;
  faceComparison: FaceComparisonResult;
}
