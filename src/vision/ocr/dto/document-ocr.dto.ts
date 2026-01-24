export interface DocumentOcrRequestDto {
  /**
   * Base64 payload of the document image (data URI or raw base64).
   */
  buffer: string;
}

export interface DocumentOcrResponseDto {
  extractedText: string;
  confidence: number;
  rawResult?: any;
}
