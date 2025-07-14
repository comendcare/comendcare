-- CreateTable
CREATE TABLE "ReportOnComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "reason" "ReviewReplyReportReason" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "ReportOnComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportOnComment" ADD CONSTRAINT "ReportOnComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportOnComment" ADD CONSTRAINT "ReportOnComment_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
