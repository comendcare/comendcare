// feed/mappers/app.ts
import crypto from "node:crypto";
import { register } from "~web/app/(platform)/app/feed/registry";

/**
 * NOTE ON CONTENT SHAPE
 * ---------------------
 * Each content payload includes:
 * - actor: { userId, name? }               // who performed the action (from payload)
 * - organization: { id: orgId }            // org context (from payload)
 * - resource-specific fields               // ids, titles, status, etc. for UI rendering
 * - extra fields when available (e.g., deadline, comment preview, etc.)
 *
 * Idempotency keys are deterministic and scoped per event + entity id,
 * with extra qualifiers where applicable (e.g., ":deadline:7").
 */

// ---------------------------
// RFP_CREATED
// ---------------------------
register("app", "org_created_rfp", async ({ payload, occurredAt }) => {
    const {
        rfpId,
        orgId,
        orgName,
        orgImage,
        title,
        deadline,
        userId,
        userName,
    } = payload as {
        rfpId: string;
        orgId?: string;
        orgName?: string;
        orgImage?: string;
        title: string;
        deadline?: string;
        userId?: string;
        userName?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:rfp:${rfpId}`)
        .digest("hex");

    return {
        type: "ORG_CREATED_RFP",
        source: "USER",
        title,
        content: {
            rfpId,
            title,
            deadline,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// --------------------------------------
// RFP_DEADLINE_APPROACHING
// --------------------------------------
register("app", "rfp_deadline_approaching", async ({ payload, occurredAt }) => {
    const {
        rfpId,
        orgId,
        title,
        deadline,
        userId,
        userName,
        // allow custom window (defaults to 7)
        windowDays,
    } = payload as {
        rfpId: string;
        orgId?: string;
        title: string;
        deadline?: string;
        userId?: string;
        userName?: string;
        windowDays?: number;
    };

    const days = Number.isFinite(windowDays) ? windowDays : 7;
    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:rfp:${rfpId}:deadline:${days}`)
        .digest("hex");

    return {
        type: "RFP_DEADLINE_APPROACHING",
        source: "USER",
        title,
        content: {
            rfpId,
            title,
            deadline,
            windowDays: days,
            actor: { userId, name: userName },
            organization: { id: orgId },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// -------------
// RFP_CLOSED
// -------------
register("app", "rfp_closed", async ({ payload, occurredAt }) => {
    const {
        rfpId,
        orgId,
        orgName,
        orgImage,
        title,
        deadline, // RFP.endDate, if available
        userId,
        userName,
    } = payload as {
        rfpId: string;
        orgId?: string;
        orgName?: string;
        orgImage?: string;
        title: string;
        deadline?: string;
        userId?: string;
        userName?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:rfp:${rfpId}:closed`)
        .digest("hex");

    return {
        type: "RFP_CLOSED",
        source: "USER",
        title,
        content: {
            rfpId,
            title,
            deadline,
            closedAt: occurredAt,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// -------------
// ORG_UPDATED
// -------------
register("app", "org_updated", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        userId,
        userName,
        changedFields, // optional array of field keys
        changes, // optional diff object { field: { before, after } }
    } = payload as {
        orgId: string;
        orgName?: string;
        userId?: string;
        userName?: string;
        changedFields?: string[];
        changes?: Record<string, { before: unknown; after: unknown }>;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:org:${orgId}:updated:${occurredAt.toISOString()}`)
        .digest("hex");

    return {
        type: "ORG_UPDATED",
        source: "USER",
        title: orgName ? `Organization updated: ${orgName}` : "Organization updated",
        content: {
            organization: { id: orgId, name: orgName },
            changedFields,
            changes,
            actor: { userId, name: userName },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ---------------------------------
// ORG_RESEARCH_PLAN_CREATED
// ---------------------------------
register("app", "org_research_plan_created", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        roadmapId, // Roadmap.id
        title, // Roadmap.title
        userId,
        userName,
        published, // boolean
    } = payload as {
        orgId: string;
        orgName?: string;
        orgImage?: string;
        roadmapId: string;
        title?: string;
        userId?: string;
        userName?: string;
        published?: boolean;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:org:${orgId}:roadmap:${roadmapId}:created`)
        .digest("hex");

    return {
        type: "ORG_RESEARCH_PLAN_CREATED",
        source: "USER",
        title: title ?? "New research plan created",
        content: {
            roadmapId,
            title,
            published,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ---------------------------------
// ORG_RESEARCH_PLAN_UPDATED
// ---------------------------------
register("app", "org_research_plan_updated", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        roadmapId,
        title,
        userId,
        userName,
        changedFields,
        changes,
        published, // updated published state (boolean)
    } = payload as {
        orgId: string;
        orgName?: string;
        roadmapId: string;
        title?: string;
        userId?: string;
        userName?: string;
        changedFields?: string[];
        changes?: Record<string, { before: unknown; after: unknown }>;
        published?: boolean;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:org:${orgId}:roadmap:${roadmapId}:updated:${occurredAt.toISOString()}`)
        .digest("hex");

    return {
        type: "ORG_RESEARCH_PLAN_UPDATED",
        source: "USER",
        title: title ? `Research plan updated: ${title}` : "Research plan updated",
        content: {
            roadmapId,
            title,
            published,
            changedFields,
            changes,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------------------------
// ORG_CREATED_PROJECT
// ------------------------------------
// Maps to Milestone (nodeType === "PROJECT") creation.
register("app", "org_created_project", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        projects, // array of { projectId, title, ... }
        userId,
        userName,
    } = payload as {
        orgId: string;
        orgName?: string;
        orgImage?: string;
        projects: Array<{
            projectId: string;
            title?: string;
            startDate?: Date | string | null;
            endDate?: Date | string | null;
            private?: boolean;
            status?: string | null;
            budget?: number | null;
            timelineOrder?: number | null;
        }>;
        userId?: string;
        userName?: string;
    };

    const idemSeed = `app:project:batch:${projects.map(p => p.projectId).sort().join(",")}`;
    const idempotencyKey = crypto.createHash("sha256").update(idemSeed).digest("hex");

    const count = projects.length;
    const title =
        count === 1
            ? `New project: ${projects[0].title ?? projects[0].projectId}`
            : `${count} new projects created`;

    return {
        type: "ORG_CREATED_PROJECT", // reuse, or add a dedicated BATCH type if you prefer
        source: "USER",
        title,
        content: {
            projects,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------------------------
// ORG_UPDATED_PROJECT
// ------------------------------------
// Maps to Milestone (nodeType === "PROJECT") updates.
// Use either `updatedAt` for idempotency or a property/newValue pair if you emit per-field changes.
register("app", "org_updated_project", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        projects, // array of project snapshots (see emitter above)
        userId,
        userName,
    } = payload as {
        orgId: string;
        orgName?: string;
        orgImage?: string;
        projects: Array<{
            projectId: string;
            title?: string | null;
            startDate?: string | null;
            endDate?: string | null;
            private?: boolean;
            status?: string | null;
            budget?: number | null;
            openTo?: string[];
            otherTypeDetails?: string | null;
            timelineOrder?: number | null;
            updatedAt?: string;
        }>;
        userId?: string;
        userName?: string;
    };

    const idemSeed = `app:project:update-batch:${projects
        .map((p) => `${p.projectId}@${p.updatedAt ?? ""}`)
        .sort()
        .join(",")}`;
    const idempotencyKey = crypto.createHash("sha256").update(idemSeed).digest("hex");

    const count = projects.length;
    const title =
        count === 1
            ? `Project updated: ${projects[0].title ?? projects[0].projectId}`
            : `${count} projects updated`;

    return {
        type: "ORG_UPDATED_PROJECT",
        source: "USER",
        title,
        content: {
            projects,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------
// ORG_CREATED_TOOL
// ------------------
register("app", "org_created_tool", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        toolId, // Tool.id
        title,  // Tool.title
        userId,
        userName,
        private: isPrivate, // Tool.private
        geneId,
        institutionId,
        types, // Tool.types (string[])
    } = payload as {
        orgId?: string;
        orgName?: string;
        orgImage?: string;
        toolId: string;
        title?: string;
        userId?: string;
        userName?: string;
        private?: boolean;
        geneId?: number;
        institutionId?: string;
        types?: string[];
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:tool:${toolId}:created`)
        .digest("hex");

    return {
        type: "ORG_CREATED_TOOL",
        source: "USER",
        title: title ? `New tool: ${title}` : "New tool created",
        content: {
            toolId,
            title,
            private: isPrivate,
            geneId,
            institutionId,
            types,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

register("app", "org_updated_tool", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        toolId,
        title,
        userId,
        userName,
        private: isPrivate,
        geneId,
        institutionId,
        types,
    } = payload as {
        orgId?: string;
        orgName?: string;
        orgImage?: string;
        toolId: string;
        title?: string;
        userId?: string;
        userName?: string;
        private?: boolean;
        geneId?: number;
        institutionId?: string;
        types?: string[];
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:tool:${toolId}:updated`)
        .digest("hex");

    return {
        type: "ORG_UPDATED_TOOL",
        source: "USER",
        title: title ? `Tool updated: ${title}` : "Tool updated",
        content: {
            toolId,
            title,
            private: isPrivate,
            geneId,
            institutionId,
            types,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------
// ORG_CREATED_RFP
// ------------------
register("app", "org_created_rfp", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        orgImage,
        rfpId,
        title,
        userId,
        userName,
        startDate, // RFP.startDate
        endDate,   // RFP.endDate (deadline)
        private: isPrivate, // RFP.private
        budget,
    } = payload as {
        orgId?: string;
        orgName?: string;
        orgImage?: string;
        rfpId: string;
        title?: string;
        userId?: string;
        userName?: string;
        startDate?: string;
        endDate?: string;
        private?: boolean;
        budget?: number;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:org:${orgId}:rfp:${rfpId}:created`)
        .digest("hex");

    return {
        type: "ORG_CREATED_RFP",
        source: "USER",
        title: title ? `RFP created: ${title}` : "RFP created",
        content: {
            rfpId,
            title,
            startDate,
            deadline: endDate,
            private: isPrivate,
            budget,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// -----------------------
// PAG_PROFILE_CREATED
// -----------------------
register("app", "pag_profile_created", async ({ payload, occurredAt }) => {
    const {
        orgId,      // PAG org id
        orgName,    // PAG org name
        orgImage,
        userId,
        userName,
    } = payload as {
        orgId: string;
        orgName?: string;
        orgImage?: string;
        userId?: string;
        userName?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:pag:${orgId}:created`)
        .digest("hex");

    return {
        type: "PAG_PROFILE_CREATED",
        source: "USER",
        title: orgName ? `PAG profile created: ${orgName}` : "PAG profile created",
        content: {
            pagOrganizationId: orgId,
            pagOrganizationName: orgName,
            pagOrganizationImage: orgImage,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName },
        },
        orgId: undefined, // explicit undefined/null so that it appears in all feeds
        occurredAt,
        idempotencyKey,
    };
});

// --------------------------
// TOOL_REQUEST_CREATED
// --------------------------
// Maps to MaterialAndDataAccessRequest creation in your schema.
register("app", "tool_request_created", async ({ payload, occurredAt }) => {
    const {
        requestId,          // MaterialAndDataAccessRequest.id
        title,              // MaterialAndDataAccessRequest.title
        orgId,              // organizationId
        orgName,
        orgImage,
        researcherId,       // requester (Researcher.id)
        userId,             // actor (User.id) – often the same as researcher.userId, but keep flexible
        userName,
        status,             // RequestStatus
        submittedAt,
    } = payload as {
        requestId: string;
        title: string;
        orgId: string;
        orgName?: string;
        orgImage?: string;
        researcherId: string;
        userId?: string;
        userName?: string;
        status?: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
        submittedAt?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:tool_request:${requestId}:created`)
        .digest("hex");

    return {
        type: "TOOL_REQUEST_CREATED",
        source: "USER",
        title: `New tool request: ${title}`,
        content: {
            requestId,
            title,
            status,
            submittedAt,
            researcherId,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------------------------
// TOOL_REQUEST_COMMENT_CREATED
// ------------------------------------
// Maps to RequestComment on MaterialAndDataAccessRequest.
register("app", "tool_request_comment_created", async ({ payload, occurredAt }) => {
    const {
        requestId,      // MaterialAndDataAccessRequest.id
        commentId,      // RequestComment.id
        orgId,
        orgName,
        orgImage,
        userId,         // commenter user id
        userName,       // commenter display name
        text,           // comment text
    } = payload as {
        requestId: string;
        commentId: string;
        orgId: string;
        orgName?: string;
        orgImage?: string;
        userId: string;
        userName?: string;
        text: string;
    };

    const preview =
        text.length > 180 ? `${text.slice(0, 177)}…` : text;

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:tool_request:${requestId}:comment:${commentId}:created`)
        .digest("hex");

    return {
        type: "TOOL_REQUEST_COMMENT_CREATED",
        source: "USER",
        title: "New comment on tool request",
        content: {
            requestId,
            commentId,
            preview,
            actor: { userId, name: userName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// --------------------------
// TOOL_REQUEST_APPROVED
// --------------------------
// Maps to MaterialAndDataAccessRequest.status -> APPROVED.
register("app", "tool_request_approved", async ({ payload, occurredAt }) => {
    const {
        requestId,
        title,
        orgId,
        orgName,
        orgImage,
        approverUserId,    // the user who approved
        approverUserName,
        approvedAt,        // optional (falls back to occurredAt)
    } = payload as {
        requestId: string;
        title?: string;
        orgId: string;
        orgName?: string;
        orgImage?: string;
        approverUserId?: string;
        approverUserName?: string;
        approvedAt?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:tool_request:${requestId}:approved`)
        .digest("hex");

    return {
        type: "TOOL_REQUEST_APPROVED",
        source: "USER",
        title: title ? `Tool request approved: ${title}` : "Tool request approved",
        content: {
            requestId,
            title,
            approvedAt: approvedAt ?? occurredAt,
            actor: { userId: approverUserId, name: approverUserName },
            organization: { id: orgId, name: orgName, image: orgImage },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});

// ------------------------------------
// SERVICE_PROVIDER_CREATED
// ------------------------------------
register("app", "service_provider_created", async ({ payload, occurredAt }) => {
    const {
        companyId,
        title,
        url,
        companyType,
        categories,
        milestoneTypes,
        services,             // string[]
        certifications,       // string[]
        tags,                 // string[]
        headquarters,
        yearEstablished,
        userId,
        userName,
    } = payload as {
        companyId: string;
        title: string;
        url?: string;
        companyType?: string;
        categories?: string[];
        milestoneTypes?: string[];
        services?: string[];
        certifications?: string[];
        tags?: string[];
        headquarters?: string;
        yearEstablished?: number | null;
        userId?: string;
        userName?: string;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:service_provider:${companyId}:created`)
        .digest("hex");

    return {
        type: "SERVICE_PROVIDER_CREATED",
        source: "USER",
        title: `New service provider: ${title}`,
        content: {
            companyId,
            title,
            url,
            companyType,
            categories,
            milestoneTypes,
            services,
            certifications,
            tags,
            headquarters,
            yearEstablished,
            actor: { userId, name: userName },
        },
        occurredAt,
        idempotencyKey,
        orgId: undefined, // explicit undefined/null so that it appears in all feeds
    };
});

// ----------------------------------------
// ORG_PROFILE_VIEWS_MILESTONE (analytics)
// ----------------------------------------
register("app", "analytics_goal_reached", async ({ payload, occurredAt }) => {
    const {
        orgId,
        orgName,
        host,          // e.g. "acme.comend.io"
        totalViews,    // lifetime public profile views (number)
        milestone,     // number crossed (e.g. 10, 100, 1000, 10000, ...)
    } = payload as {
        orgId: string;
        orgName?: string;
        host?: string;
        totalViews: number;
        milestone: number;
    };

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`app:org:${orgId}:views:${milestone}`)
        .digest("hex");

    const nice = milestone.toLocaleString();
    return {
        type: "ANALYTICS_GOAL_REACHED",
        source: "PLATFORM",
        title: `🎉 ${nice} public profile views!`,
        content: {
            milestone,
            totalViews,
            host,
            organization: { id: orgId, name: orgName },
        },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});
