-- CreateEnum
CREATE TYPE "FeedSource" AS ENUM ('USER', 'PLATFORM', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "FeedItemType" AS ENUM ('ORG_UPDATED', 'ORG_RESEARCH_PLAN_UPDATED', 'ORG_CREATED_TOOL', 'ORG_CREATED_RFP', 'RFP_CREATED', 'RFP_DEADLINE_APPROACHING', 'RFP_CLOSED', 'PAPER_PUBLISHED_AGNOSTIC', 'PAPER_PUBLISHED_GROUP', 'SERVICE_PROVIDER_CREATED', 'PAG_PROFILE_CREATED', 'TOOL_REQUEST_CREATED', 'TOOL_REQUEST_COMMENT_CREATED', 'FEED_POST_CREATED', 'COMEND_UPDATE', 'SERVICE_PROVIDER_RECOMMENDED', 'PAG_RECOMMENDED', 'PROJECTS_RECOMMENDED', 'ANALYTICS_GOAL_REACHED', 'RESEARCHER_RECOMMENDED', 'CTG_TRIAL_POSTED', 'FDA_MEDWATCH_ALERT', 'FDA_WHATS_NEW_DRUGS', 'FDA_WHATS_NEW_VBB', 'FDA_PRESS_RELEASE');

-- CreateEnum
CREATE TYPE "IngestStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "type" "FeedItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSON,
    "source" "FeedSource" NOT NULL,
    "externalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgId" TEXT,
    "userId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "rawEventId" TEXT,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawIngestEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" JSON NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupeKey" TEXT NOT NULL,
    "status" "IngestStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "RawIngestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_idempotencyKey_key" ON "FeedItem"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_rawEventId_key" ON "FeedItem"("rawEventId");

-- CreateIndex
CREATE INDEX "FeedItem_orgId_createdAt_idx" ON "FeedItem"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedItem_userId_createdAt_idx" ON "FeedItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FeedItem_type_createdAt_idx" ON "FeedItem"("type", "createdAt");

-- CreateIndex
CREATE INDEX "FeedItem_createdAt_idx" ON "FeedItem"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RawIngestEvent_dedupeKey_key" ON "RawIngestEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "RawIngestEvent_provider_occurredAt_idx" ON "RawIngestEvent"("provider", "occurredAt");

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "RawIngestEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
