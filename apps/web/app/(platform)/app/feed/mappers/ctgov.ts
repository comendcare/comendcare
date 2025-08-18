// feed/mappers/ctgov.ts
import crypto from "node:crypto";
import { register } from "../registry";

register("ctgov", "trial_posted", async ({ payload, occurredAt }) => {
    const trial = payload as { NCTId: string; BriefTitle: string; CurrentRecruitmentStatus?: string; Conditions?: string[]; Locations?: string[] };
    if (!trial?.NCTId) return null;

    const idempotencyKey = crypto.createHash("sha256").update(`ctgov:${trial.NCTId}`).digest("hex");

    return {
        type: "CTG_TRIAL_POSTED",
        source: "THIRD_PARTY",
        title: trial.BriefTitle,
        content: {
            nctId: trial.NCTId,
            briefTitle: trial.BriefTitle,
            status: trial.CurrentRecruitmentStatus,
            conditions: trial.Conditions,
            locations: trial.Locations,
        },
        externalUrl: `https://clinicaltrials.gov/study/${trial.NCTId}`,
        occurredAt,
        idempotencyKey,
    };
});
