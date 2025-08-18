// feed/mappers/app.ts
import crypto from "node:crypto";
import { register } from "../registry";

register("app", "rfp_created", async ({ payload, occurredAt }) => {
    const { rfpId, orgId, title, deadline } = payload as { rfpId: string; orgId?: string; title: string; deadline?: string };
    const idempotencyKey = crypto.createHash("sha256").update(`app:rfp:${rfpId}`).digest("hex");

    return {
        type: "RFP_CREATED",
        source: "USER",
        title,
        content: { rfpId, deadline },
        orgId,
        occurredAt,
        idempotencyKey,
    };
});
