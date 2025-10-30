'use server'
import { Analytics } from "@customerio/cdp-analytics-node"
import { nanoid } from "@reduxjs/toolkit";
import { APIClient, SendEmailRequest } from "customerio-node"
import { Session } from "next-auth";

// NodeJS CustomerIO docs: https://customer.io/docs/cdp/sources/connections/servers/node/

const IS_PROD = (() => {
    // Highest precedence: Vercel’s environment flag if present
    if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production"
    // Fallback to your own flags
    const env = process.env.NEXT_PUBLIC_NODE_ENV ?? process.env.NODE_ENV
    return env === "production"
})();

type AnalyticsCall = (args: any) => Promise<void> | void
class NoopAnalytics {
    identify: AnalyticsCall = async () => {}
    track:    AnalyticsCall = async () => {}
    page:     AnalyticsCall = async () => {}
    group:    AnalyticsCall = async () => {}
    alias:    AnalyticsCall = async () => {}
}

class CustomerIO {
    static instance: CustomerIO
    analytics: Analytics | NoopAnalytics

    private constructor() {
        const envMsg = IS_PROD ? "production" : "non-production"
        console.log(`[CustomerIO] Initializing analytics in ${envMsg} mode`)

        this.analytics = IS_PROD
            ? new Analytics({
                writeKey: process.env.CUSTOMER_IO_WRITE_KEY || "",
                host: "https://cdp.customer.io",
            })
            : new NoopAnalytics()
    }

    static getInstance(): CustomerIO {
        if (!CustomerIO.instance) CustomerIO.instance = new CustomerIO()
        return CustomerIO.instance
    }

    async flush() {
        await (this.analytics as any).closeAndFlush()
    }
}

export async function customerIOIdentify(distinctId: string, session: Session) {
    const instance = CustomerIO.getInstance()
    console.log(`[CustomerIO] Identify called for userId=${distinctId}`)

    instance.analytics.identify({
        userId: distinctId,
        traits: {
            name: session.user.name,
            email: session.user.email,
        }
    })
}

export async function getCustomerIOInstance(): Promise<CustomerIO> {
    return CustomerIO.getInstance()
}

export async function customerIOTrack(data: { userId: string | undefined, event: string, properties: any}) {
    const instance = await getCustomerIOInstance()
    const resolvedUserId = data.userId || data.properties.email || nanoid()
    console.log(`[CustomerIO] Track event=${data.event} userId=${resolvedUserId}`)

    try {
        instance.analytics.track({
            userId: resolvedUserId,
            event: data.event,
            properties: data.properties,
        })
        console.log(`[CustomerIO] Track event '${data.event}' queued successfully`)
    } catch (err) {
        console.error(`[CustomerIO] Track event '${data.event}' failed:`, err)
    }
}

export async function sendCustomerIOFeedbackEmail(emailPayload: any, attachments: any[]) {
    const client = new APIClient(process.env.CUSTOMER_IO_API_KEY || "");
    const request = new SendEmailRequest(emailPayload)

    for (const attachment of attachments) {
        request.attach(attachment.filename, attachment.content, { encode: false })
    }

    try {
        client.sendEmail(request)
    } catch (e) {
        console.error(`Error sending email`, e)
    }
}

export async function sendCustomerIOContactEmail(emailPayload: any) {
    const client = new APIClient(process.env.CUSTOMER_IO_API_KEY || "");
    const request = new SendEmailRequest(emailPayload)

    try {
        client.sendEmail(request)
    } catch (e) {
        console.error(`Error sending email`, e)
    }
}

export async function customerIOOnResearchPlanCreated(
    userId: string,
    props: Record<string, any> = {}
) {
    const instance = await getCustomerIOInstance();
    console.log(`[CustomerIO] Research plan created for userId=${userId}`);

    try {
        // ✅ await these so failures throw here (not after the function returns)
        await instance.analytics.track({
            userId,
            event: "created_research_plan",
            properties: props,
        });
        console.log("[CustomerIO] 'created_research_plan' event queued");

        await instance.analytics.identify({
            userId,
            traits: { has_research_plan: true, ...props },
        });
        console.log("[CustomerIO] has_research_plan trait queued");
    } catch (err) {
        console.error("[CustomerIO] Error during research plan event/identify:", err);
    } finally {
        // ✅ In serverless, flush before returning so events aren't dropped
        // Use a short timeout so you never hang the request
        const FLUSH_TIMEOUT_MS = 1500;
        await Promise.race([
            instance.flush(),            // calls closeAndFlush under the hood
            new Promise((r) => setTimeout(r, FLUSH_TIMEOUT_MS)),
        ]);
    }
}
