"use server"
import {render} from "@react-email/render"
import sgMail from "@sendgrid/mail"
import ContactEmail from "@/packages/transactional/emails/contact/contact-email"
import rateLimit from "@/lib/rate-limit";
import axios from "axios";
import WaitlistEmail from "@/packages/transactional/emails/contact/waitlist-email";
import InviteToOrganizationEmail from "@/packages/transactional/emails/invitations/invite-to-organization-email";

const limiter = rateLimit({
    interval: 600 * 1000, // 10 minutes (600 seconds * 1000 ms)
    uniqueTokenPerInterval: 500 // Max 500 IPs
})

// from: https://medium.com/how-to-react/how-to-get-user-ip-address-in-react-js-73eb295720d0
const getIp = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json")
    return res.data.ip
}

const sendEmail = async (message: {
    to: string | string[];
    from: string;
    subject: string;
    text?: string;
    html: string
}) => {
    // this may throw an error - errors handled outside send email
    const clientIp = await getIp()
    const blocked = await limiter.check(5, clientIp) // Limit to 5 requests per 10 minutes

    if (blocked) throw Error("Rate limit exceeded.", {cause: "RATE-LIMIT"})

    sgMail
        .send(message)
        .then(() => {
            console.log("Email sent")
        })
        .catch((error: Error) => {
            console.error(error)
            throw error
        })
}

export async function sendContactEmail(params: {
    user: { name: string | null | undefined; email: string | null | undefined }
    message: string | null | undefined
}) {
    const emailTemplate = await render(
        ContactEmail({name: params.user.name, email: params.user.email, message: params.message})
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.user.email) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: "hello@comendcare.com",
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: "Contact form message"
        }
        await sendEmail(msg)
    }
}

export async function sendBetaSignupEmail(params: {
    user: { name: string | null | undefined; email: string | null | undefined }
}) {
    const emailTemplate = await render(
        WaitlistEmail({name: params.user.name, email: params.user.email})
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.user.email) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: "hello@comendcare.com",
            from: "megan@comendcare.com",
            html: emailTemplate,
            text: "Add this user to the waitlist",
            subject: "[WAITLIST] Beta tester waitlist request"
        }
        await sendEmail(msg)
    }
}

export async function sendInviteEmail(params: {
    invitee: {
        name: string | undefined
        email: string | null | undefined
        image: string | null | undefined
    }
    inviter: {
        name: string | null | undefined
        email: string | null | undefined
        image: string | null | undefined
        organizationName: string | undefined
        organizationImage: string | undefined
        ip: string | undefined
    }
    inviteLink: string | undefined
}) {
    const emailTemplate = await render(
        InviteToOrganizationEmail(
            {
                username: params.invitee.name,
                userImage: params.invitee.image,
                invitedByUsername: params.inviter.name,
                invitedByEmail: params.inviter.email,
                organizationName: params.inviter.organizationName,
                organizationImage: params.inviter.organizationImage,
                inviteLink: params.inviteLink,
                inviteFromIp: params.inviter.ip,
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.invitee.email) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: params.invitee.email,
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: "Contact form message"
        }
        await sendEmail(msg)
    }
}

