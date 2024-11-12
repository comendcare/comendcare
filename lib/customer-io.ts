'use server'
import Analytics from "@customerio/cdp-analytics-node"
import { nanoid } from "@reduxjs/toolkit";
import { APIClient, SendEmailRequest } from "customerio-node"
import { Session } from "next-auth";

// NodeJS CustomerIO docs: https://customer.io/docs/cdp/sources/connections/servers/node/

class CustomerIO {
    static instance: CustomerIO
    analytics: Analytics

    constructor() {
        this.analytics = new Analytics({
            writeKey: process.env.CUSTOMER_IO_WRITE_KEY || '',
            host: 'https://cdp.customer.io',
        })
    }

    static getInstance(): CustomerIO {
        if (!CustomerIO.instance) CustomerIO.instance = new CustomerIO()
        return CustomerIO.instance
    }
}

export async function customerIOIdentify(distinctId: string, session: Session) {
    const instance = CustomerIO.getInstance()

    instance.analytics.identify({
        userId: distinctId,
        traits: {
            name: session.user.name,
            email: session.user.email,
        }
    })
}

export async function getCustomerIOInstance(): Promise<CustomerIO> {
    if (!CustomerIO.instance) CustomerIO.instance = new CustomerIO()
    return CustomerIO.instance
}

export async function customerIOTrack(data: { userId: string | undefined, event: string, properties: any}) {
    const instance = await getCustomerIOInstance()

    if (data.userId) {
        instance.analytics.track({
            userId: data.userId,
            event: data.event,
            properties: data.properties
        })
    } else {
        instance.analytics.track({
            userId: data.properties.email || nanoid(),
            event: data.event,
            properties: data.properties
        })
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