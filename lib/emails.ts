"use server"
import {render} from "@react-email/render"
import sgMail from "@sendgrid/mail"
import ContactEmail from "@/packages/transactional/emails/contact/contact-email"
import PAGContactEmail from "@/packages/transactional/emails/pag/contact-email";
import rateLimit from "@/lib/rate-limit";
import axios from "axios";
import WaitlistEmail from "@/packages/transactional/emails/contact/waitlist-email";
import InviteToOrganizationEmail from "@/packages/transactional/emails/invitations/invite-to-organization-email";
import {NewMemberRequestEmail} from "@/packages/transactional/emails/invitations/new-member-request-email";
import NewOrganizationEmail from "@/packages/transactional/emails/admins/new-organization";
import memberRequestApprovedEmail from "@/packages/transactional/emails/invitations/member-request-approved-email";
import memberRequestDeniedEmail from "@/packages/transactional/emails/invitations/member-request-denied-email";
import MemberDeletedEmail from "@/packages/transactional/emails/invitations/member-deleted-email";

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

export async function sendPAGContactEmail(params: {
    name: string | null | undefined; email: string | null | undefined; message: string | null | undefined; organizationEmail: string | null | undefined;
}) {
    const emailTemplate = await render(
        PAGContactEmail({name: params.name, sendingEmail: params.email, message: params.message, receivingEmail: params.organizationEmail})
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.email && params.organizationEmail) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: params.organizationEmail,
            from: "contact@comendcare.com",
            html: emailTemplate,
            text: "Someone is reaching out on Comend",
            subject: "Someone is reaching out on Comend"
        }
        await sendEmail(msg)
    }
}

export async function sendNewOrganizationEmail(params: {
    user: { name: string | null | undefined; email: string | null | undefined }
    organization: { name: string | null | undefined; subdomain: string | null | undefined }
}) {
    const emailTemplate = await render(
        NewOrganizationEmail(
            {
                user: {
                    name: params.user.name,
                    email: params.user.email
                },
                organization: {
                    name: params.organization.name,
                    subdomain: params.organization.subdomain
                }
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    const msg = {
        to: ["hello@comendcare.com", "flawnson@comendcare.com"],
        from: "contact@comendcare.com",
        html: emailTemplate,
        text: "New organization",
        subject: "A new organization has been created."
    }
    await sendEmail(msg)
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
            subject: `Join ${params.inviter.name} on Comend`
        }
        await sendEmail(msg)
    }
}

export async function sendMemberDeletedEmail(params: {
    name: string | null | undefined
    email: string | null | undefined
    organizationName: string | undefined
    organizationImage: string | undefined
}) {
    const emailTemplate = await render(
        MemberDeletedEmail(
            {
                userName: params.name,
                userEmail: params.email,
                organizationName: params.organizationName,
                organizationImage: params.organizationImage,
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.email) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: params.email,
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: `Your membership to ${params.organizationName} has been removed`
        }
        await sendEmail(msg)
    }
}


export async function sendMemberRequestCreatedEmail(params: {
    user: {
        name: string | null | undefined
        email: string | null | undefined
        image: string | null | undefined
    }
    admin: {
        name: string | null | undefined
        email: string | null | undefined
        organizationName: string | undefined
        organizationImage: string | undefined
    }
}) {
    const emailTemplate = await render(
        NewMemberRequestEmail(
            {
                requestedByUserName: params.user.name,
                requestedByUserImage: params.user.image,
                requestedByUserEmail: params.user.email,
                adminName: params.admin.name,
                adminEmail: params.admin.email,
                organizationName: params.admin.organizationName,
                organizationImage: params.admin.organizationImage,
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.admin.email) {
        const msg = {
            // to: 'flawnsontong1@gmail.com', // NOTE: for testing purposes, you can change the recipient of the emails
            to: params.admin.email,
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: `${params.user.name} is requesting to join you on Comend`
        }
        await sendEmail(msg)
    }
}


export async function sendMemberRequestApprovedEmail(params: {
    name: string | null | undefined
    email: string | null | undefined
    organizationName: string | undefined
    organizationImage: string | undefined
}) {
    const emailTemplate = await render(
        memberRequestApprovedEmail(
            {
                userName: params.name,
                userEmail: params.email,
                organizationName: params.organizationName,
                organizationImage: params.organizationImage,
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.email) {
        const msg = {
            to: params.email,
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: `Your request to join ${params.organizationName} has been approved.`,
        }
        await sendEmail(msg)
    }
}

export async function sendMemberRequestDeniedEmail(params: {
    name: string | null | undefined
    email: string | null | undefined
    organizationName: string | undefined
    organizationImage: string | undefined
}) {
    const emailTemplate = await render(
        memberRequestDeniedEmail(
            {
                userName: params.name,
                userEmail: params.email,
                organizationName: params.organizationName,
                organizationImage: params.organizationImage,
            }
        )
    )

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    if (params.email) {
        const msg = {
            to: params.email,
            from: "corporate@comendcare.com",
            html: emailTemplate,
            text: "A user has sent a message via the contact page.",
            subject: `Your request to join ${params.organizationName} has been denied.`,
        }
        await sendEmail(msg)
    }
}

