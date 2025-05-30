-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('READ', 'WRITE', 'ROOT');

-- CreateEnum
CREATE TYPE "IncorporationStatus" AS ENUM ('YES', 'NO', 'INPROGRESS');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('YES', 'NO', 'INPROGRESS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "gh_username" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "country" TEXT,
    "formattedAddress" TEXT,
    "notificationSettings" BOOLEAN NOT NULL DEFAULT false,
    "postalCode" TEXT,
    "region" TEXT,
    "title" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "consentSettings" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" VARCHAR NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" VARCHAR NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "secret" TEXT,
    "type" "ClientType" NOT NULL DEFAULT 'WRITE',
    "organizationSlug" TEXT NOT NULL,
    "organizationId" TEXT,
    "cors" TEXT,
    "crossDomain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires_in" INTEGER,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "origin" DOUBLE PRECISION[] DEFAULT ARRAY[0.0, 0.0]::DOUBLE PRECISION[],
    "roadmapId" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "budget" INTEGER,
    "roadmapId" TEXT NOT NULL,
    "endDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "private" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'NOTYPE',
    "otherTypeDetails" TEXT,
    "RFPId" TEXT,
    "assetId" TEXT,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kanban" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kanban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Column',
    "kanbanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kanbanPosition" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PLANNED',
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT DEFAULT '',
    "milestoneId" TEXT,
    "kanbanPosition" INTEGER NOT NULL,
    "orderPosition" INTEGER NOT NULL,
    "columnId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "priority" TEXT,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStakeholder" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TaskStakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL,
    "taskId" TEXT NOT NULL,
    "orderPosition" INTEGER,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RFP" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "funding" INTEGER NOT NULL,
    "description" TEXT,
    "researchFocus" TEXT NOT NULL DEFAULT 'NOTYPE',
    "openTo" TEXT NOT NULL DEFAULT 'ALL',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "RFP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "link" TEXT NOT NULL,
    "rFPId" TEXT,
    "assetId" TEXT,
    "milestoneId" TEXT,

    CONSTRAINT "ExternalAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalContact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "rFPId" TEXT,
    "assetId" TEXT,

    CONSTRAINT "ExternalContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" TEXT,
    "data" JSONB,
    "roadmapId" TEXT NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "logo" TEXT DEFAULT 'https://public.blob.vercel-storage.com/eEZHAoPTOBSYGBE3/JRajRyC-PhBHEinQkupt02jqfKacBVHLWJq7Iy.png',
    "font" TEXT NOT NULL DEFAULT 'font-cal',
    "image" TEXT,
    "imageBlurhash" TEXT DEFAULT 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC',
    "headerImage" TEXT,
    "subdomain" TEXT,
    "customDomain" TEXT,
    "message404" TEXT DEFAULT 'Blimey! You''ve found a page that doesn''t exist.',
    "statedGoal" "Goal",
    "yearFounded" TEXT,
    "incorporationStatus" "IncorporationStatus",
    "website" TEXT,
    "moneyRaised" INTEGER,
    "moneyDeployed" INTEGER,
    "researchBudget" INTEGER,
    "address1" TEXT,
    "address2" TEXT,
    "formattedAddress" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "followedType" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "interestedModalities" TEXT[],
    "diseaseCategories" TEXT[],
    "prevalenceNumerator" INTEGER,
    "prevalenceDenominator" INTEGER,
    "numberOfPatientsEngaged" INTEGER,
    "nationalEstimatedPopulation" INTEGER,
    "globalEstimatedPopulation" INTEGER,
    "relevantDiseaseMechanisms" TEXT[],
    "associatedGenes" TEXT[],
    "associatedSystems" TEXT[],
    "associatedSignsAndSymptoms" TEXT[],
    "existingDatabasesAndStudies" TEXT[],
    "assetsUnderDevelopment" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gardURL" TEXT,
    "nordURL" TEXT,
    "summary" TEXT,
    "prevalenceRatio" DOUBLE PRECISION,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionToOrganization" (
    "id" TEXT NOT NULL,
    "conditionId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "ConditionToOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "domainCount" INTEGER,
    "url" TEXT,
    "image" TEXT,
    "imageBlurhash" TEXT,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" JSONB,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reactableId" TEXT NOT NULL,
    "reactableType" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "mentionedType" TEXT NOT NULL,
    "mentionedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gene" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT,
    "symbol" TEXT,
    "name" TEXT,
    "hgncId" TEXT,
    "locusGroup" TEXT,
    "locusType" TEXT,
    "location" TEXT,
    "locationSortable" TEXT,
    "entrezId" TEXT,
    "ensemblGeneId" TEXT,
    "ucscId" TEXT,
    "refseqAccessions" TEXT[],
    "vegaId" TEXT,
    "omimIds" TEXT[],
    "uniprotIds" TEXT[],
    "aliasSymbols" TEXT[],
    "prevSymbols" TEXT[],
    "prevNames" TEXT[],
    "aliasNames" TEXT[],
    "geneGroups" TEXT[],
    "geneGroupIds" INTEGER[],
    "pubmedIds" INTEGER[],
    "agr" TEXT,
    "status" TEXT,
    "dateApprovedReserved" TIMESTAMP(3),
    "dateModified" TIMESTAMP(3),
    "dateNameChanged" TIMESTAMP(3),
    "dateSymbolChanged" TIMESTAMP(3),
    "rnaCentralIds" TEXT[],
    "lncipedia" TEXT,
    "pseudogeneOrg" TEXT,
    "merops" TEXT,
    "maneSelect" TEXT[],
    "ena" TEXT[],
    "ccdsIds" TEXT[],
    "rgdIds" TEXT[],
    "mgdIds" TEXT[],
    "orphanet" INTEGER,
    "lsdb" TEXT[],

    CONSTRAINT "Gene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_organizationId_key" ON "Member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_organizationId_key" ON "Invitation"("email", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRequest_userId_organizationId_key" ON "MemberRequest"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Roadmap_organizationId_idx" ON "Roadmap"("organizationId");

-- CreateIndex
CREATE INDEX "Roadmap_userId_idx" ON "Roadmap"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_organizationId_key" ON "Roadmap"("slug", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Node_id_key" ON "Node"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_id_key" ON "Milestone"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_nodeId_key" ON "Milestone"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Kanban_organizationId_key" ON "Kanban"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Column_id_key" ON "Column"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStakeholder_taskId_userId_key" ON "TaskStakeholder"("taskId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_id_key" ON "ChecklistItem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RFP_id_key" ON "RFP"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_id_key" ON "Asset"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAttachment_id_key" ON "ExternalAttachment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalContact_id_key" ON "ExternalContact"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Edge_id_key" ON "Edge"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_subdomain_key" ON "Organization"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_customDomain_key" ON "Organization"("customDomain");

-- CreateIndex
CREATE INDEX "Organization_userId_idx" ON "Organization"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_followedType_followedId_key" ON "Follow"("userId", "followedType", "followedId");

-- CreateIndex
CREATE UNIQUE INDEX "Condition_slug_key" ON "Condition"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionToOrganization_conditionId_organizationId_key" ON "ConditionToOrganization"("conditionId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_authorId_reactableType_reactableId_key" ON "Reaction"("authorId", "reactableType", "reactableId");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_uuid_key" ON "Gene"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_symbol_key" ON "Gene"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Gene_ensemblGeneId_key" ON "Gene"("ensemblGeneId");

-- CreateIndex
CREATE INDEX "idx_symbol" ON "Gene"("symbol");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRequest" ADD CONSTRAINT "MemberRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberRequest" ADD CONSTRAINT "MemberRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_RFPId_fkey" FOREIGN KEY ("RFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kanban" ADD CONSTRAINT "Kanban_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "Kanban"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStakeholder" ADD CONSTRAINT "TaskStakeholder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStakeholder" ADD CONSTRAINT "TaskStakeholder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAttachment" ADD CONSTRAINT "ExternalAttachment_rFPId_fkey" FOREIGN KEY ("rFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalContact" ADD CONSTRAINT "ExternalContact_rFPId_fkey" FOREIGN KEY ("rFPId") REFERENCES "RFP"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES "Condition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionToOrganization" ADD CONSTRAINT "ConditionToOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

