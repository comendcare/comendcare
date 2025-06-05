import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"
import { notFound, redirect } from "next/navigation"
import { getOrganizationData } from "@/lib/fetchers"
import { fontMapper } from "@/styles/fonts"
import { Metadata } from "next"
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

export async function generateMetadata({
    params
}: {
    params: { domain: string }
}): Promise<Metadata | null> {
    const domain = decodeURIComponent(params.domain)
    const data = await getOrganizationData(domain, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
        })
    if (!data) {
        return null
    }
    const {
        name: title,
        description,
        image,
        logo
    } = data as {
        name: string
        description: string
        image: string
        logo: string
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@vercel"
        },
        icons: [logo],
        metadataBase: new URL(`https://${domain}`)
        // Optional: Set canonical URL to custom domain if it exists
        // ...(params.domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
        //   data.customDomain && {
        //     alternates: {
        //       canonical: `https://${data.customDomain}`,
        //     },
        //   }),
    }
}

export default async function SiteLayout({
    params,
    children
}: {
    params: { domain: string }
    children: ReactNode
}) {

    return (
        <div>
            <LandingNavbar />
            <div>{children}</div>
        </div>
    )
}
