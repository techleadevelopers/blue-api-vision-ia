import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { VisionOcrService } from './vision-ocr.service';
import type {
  DocumentOcrRequestDto,
  DocumentOcrResponseDto,
} from './dto/document-ocr.dto';

@Controller('vision/ocr')
export class VisionOcrController {
  constructor(private readonly ocrService: VisionOcrService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async extract(
    @Body() payload: DocumentOcrRequestDto,
  ): Promise<DocumentOcrResponseDto> {
    return this.ocrService.extractFromDocument(payload);
  }
}
