-- CreateTable
CREATE TABLE "Blacklist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_email_key" ON "Blacklist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Blacklist_emailHash_key" ON "Blacklist"("emailHash");
