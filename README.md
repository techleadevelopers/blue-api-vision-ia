# 🔵 Blue API Vision IA

Este repositório expõe uma API NestJS leve pensada para funcionar como um complemento especializado ao backend principal. O foco está em orquestrar processamentos de imagem (Remove.bg + Cloudinary), upload final em UploadThing, OCR documentário e checagem de identidade com liveness e face match “auditados” para a integração com o Prisma do core.

## Arquitetura geral

- **Entrypoint:** o bootstrap em `src/main.ts:1` habilita CORS, limita JSON/URL-encoded a `10 MB`, e usa `process.env.PORT || 3001` para escutar (sem contar com body parsers), garantindo compatibilidade com uploads pesados.
- **Módulo raiz:** `src/app.module.ts:1` importa o pipeline tradicional (`ProcessorModule`, `StorageModule`) junto com os dois módulos de visão (`VisionOcrModule`, `VisionIdentityCheckModule`) para registrar todas as rotas do `/vision`.

## Módulos e rotas expostas

### 1. Processor pipeline (`/vision/process-avatar`)
- `ProcessorController` (`src/processor/processor.controller.ts:1`) recebe o `multipart/form-data`, valida o buffer e invoca o `ProcessorService` para aplicar a IA premium antes de mandar para o `UploadService`.
- `ProcessorService` (`src/processor/processor.service.ts:1`) ainda está em branco e precisa encapsular as chamadas ao Remove.bg, Cloudinary e quaisquer regras de transformação. Sem essa implementação, o upload final fica inviável.

### 2. Storage (`/upload/...` ou internal)
- `StorageModule` (`src/storage/storage.module.ts:1`) registra o `UploadService` e o exporta para uso por outros módulos, como o processor.
- `UploadService` (`src/storage/upload.service.ts:1`) conversa com o `UTApi` do UploadThing: constrói um `Blob` a partir do `Buffer`, envia, extrai a URL (com fallback para `utfs.io`) e lança exceções amigáveis. O arquivo `src/upload/upload.controller.ts` está referenciado na importação mas não existe — essa rota precisa ser criada para completar o módulo.

### 3. Vision OCR (`/vision/ocr`)
- `VisionOcrModule` desempenha a extração textual com `tesseract.js` (`package.json:21`) por meio de `VisionOcrService` (`src/vision/ocr/vision-ocr.service.ts:9`).
- A rota `/vision/ocr` aceita um `buffer` base64 pelo DTO (`src/vision/ocr/dto/document-ocr.dto.ts:1`), executa OCR em português e retorna exatamente `{ extractedText, confidence, rawResult }` para que o backend principal consuma sem adaptação.
- A normalização de confiança vai para o intervalo `[0,1]`, e o raw result (JSON bruto do Tesseract) é mantido como payload auxiliar.

### 4. Vision Identity Check (`/vision/identity-check`)
- `VisionIdentityCheckModule` (`src/vision/identity-check/vision-identity-check.module.ts:1`) expõe `/vision/identity-check` via `VisionIdentityCheckController` (`src/vision/identity-check/vision-identity-check.controller.ts:1`).
- O serviço (`src/vision/identity-check/vision-identity-check.service.ts:13`) transforma selfie e documento em hashes SHA-256, calcula uma pontuação normalizada e aplica heurísticas simples de liveness.
- A resposta segue o contrato exigido: `{ isLive, score, details?, faceComparison: { match, score, details? } }` (veja DTO em `src/vision/identity-check/dto/identity-check.dto.ts:1`), pronto para alimentar o `prisma.provider.update`.

## Configuração e variáveis de ambiente

- As variáveis esperadas estão centralizadas em `src/config/env.config.ts:1`: `REMOVE_BG_API_KEY`, `UPLOADTHING_TOKEN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` e `PORT`. Elas devem ser definidas no `.env` antes de rodar o app.
- O mesmo arquivo já expõe `PORT` com default `3001`, alinhando-se ao `main` e permitindo `process.env.PORT` no deploy.

## Desenvolvimento

1. Instale dependências: `npm install`.
2. Ajuste `.env` com as chaves acima.
3. Rode em modo watch: `npm run start:dev`.
4. Para produção, `npm run build` seguido de `npm run start:prod`.
5. Scripts auxiliares:
   - `npm run lint`
   - `npm run test` (estrutural)
   - `npm run test:e2e`
   - `npm run test:cov`

## Auditoria e próximos passos

- **ProcessorService ausente:** Sem lógica no arquivo `src/processor/processor.service.ts:1`, o fluxo de IA não está operacional. Defina aí a integração Remove.bg + Cloudinary + normalização antes de confiar no upload final.
- **UploadController faltante:** `StorageModule` importa `./upload/upload.controller` mas esse arquivo não existe. Crie-o com endpoints CRUD ou remoção, conforme o core exigir, para que o módulo compile corretamente.
- **Lógica facial simulada:** O `VisionIdentityCheckService` usa hashes e heurísticas estáticas. Troque rapidamente pelos provedores oficiais (Google Vision, BioID, etc.) para evitar falsos negativos/positivos antes de ir à produção.
- **Documentação de retorno:** os formatos JSON retornados pelas rotas `/vision/ocr` e `/vision/identity-check` já seguem o contrato do Prisma, mas vale adicionar testes de contrato para prevenir regressões.

## Implantação

- Garanta variáveis no ambiente de produção.
- Use `npm run build` e execute `node dist/main` (ou `npm run start:prod`).
- A porta padrão é 3001, e CORS + limites de payload já estão ativos (`src/main.ts:1`).

