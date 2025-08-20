-- CreateTable
CREATE TABLE "RoadmapIdempotency" (
    "key" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapIdempotency_pkey" PRIMARY KEY ("key")
);
