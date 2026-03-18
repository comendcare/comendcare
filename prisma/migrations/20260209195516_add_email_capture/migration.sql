-- CreateTable
CREATE TABLE "EmailCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "EmailCapture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailCapture_email_key" ON "EmailCapture"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailCapture_emailHash_key" ON "EmailCapture"("emailHash");
