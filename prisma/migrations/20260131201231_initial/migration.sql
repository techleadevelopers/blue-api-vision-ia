-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('CREATED', 'SCRIPT_READY', 'TTS_READY', 'RENDER_READY', 'READY_TO_POST_MANUAL', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "niche" TEXT,
    "avatar" TEXT,
    "promise" TEXT,
    "hooks" TEXT[],
    "ctas" TEXT[],
    "voices" TEXT[],
    "templates" TEXT[],
    "forbiddenWords" TEXT[],
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentJob" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "step" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'CREATED',
    "payload" JSONB,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "platformPostId" TEXT,
    "url" TEXT,
    "caption" TEXT,
    "publishedAt" TIMESTAMP(3),
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsightSnapshot" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,

    CONSTRAINT "InsightSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Theme_createdAt_idx" ON "Theme"("createdAt");

-- CreateIndex
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt");

-- CreateIndex
CREATE INDEX "ContentJob_accountId_createdAt_idx" ON "ContentJob"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentJob_themeId_createdAt_idx" ON "ContentJob"("themeId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentJob_status_createdAt_idx" ON "ContentJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_jobId_key" ON "Post"("jobId");

-- CreateIndex
CREATE INDEX "InsightSnapshot_postId_capturedAt_idx" ON "InsightSnapshot"("postId", "capturedAt");

-- AddForeignKey
ALTER TABLE "ContentJob" ADD CONSTRAINT "ContentJob_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentJob" ADD CONSTRAINT "ContentJob_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ContentJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsightSnapshot" ADD CONSTRAINT "InsightSnapshot_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
