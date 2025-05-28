-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "AssetToMilestone" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Condition" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ConditionToOrganization" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Edge" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Example" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ExternalAttachment" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ExternalContact" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Gene" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Kanban" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "MemberRequest" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Mention" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "MilestoneToReview" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "MilestoneType" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "MilestoneTypeOnMilestone" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "PharmaProject" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "RFI" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "RFP" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "RFPToMilestone" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Reply" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ReportOnReply" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ReportOnReview" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ReviewFeedback" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "SavedCompany" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "TaskStakeholder" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Whitelist" ADD COLUMN     "metadata" JSONB;
