import {ReactNode} from "react"
import {notFound, redirect} from "next/navigation"
import {getOrganizationData} from "@comend/lib/fetchers"
import {Metadata} from "next"
import PublicPageFooter from "~web/components/public-page-footer"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {PublicPageNavbar} from "~web/components/public-page-navbar";

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

    const baseUrl = `https://${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: baseUrl,
            images: image ? [image] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@comendcare"
        },
        icons: {
            icon: logo ? [logo] : undefined,
        },
        metadataBase: new URL(`https://${domain}`),
        // Optional: Set canonical URL to custom domain if it exists
        // ...(params.domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
        //   data.customDomain && {
        //     alternates: {
        //       canonical: `https://${data.customDomain}`,
        //     },
        //   }),
        alternates: `https://${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            ? {
                canonical: baseUrl,
            }
            : undefined,
    }
}

export default async function SiteLayout({
                                             params,
                                             children
                                         }: {
    params: { domain: string }
    children: ReactNode
}) {
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
        notFound()
    }

    // Optional: Redirect to custom domain if it exists
    if (
        domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
        data.customDomain &&
        process.env.REDIRECT_TO_CUSTOM_DOMAIN_IF_EXISTS === "true"
    ) {
        return redirect(`https://${data.customDomain}`)
    }

    return (
        <div>
            <TooltipProvider>
                <div>
                    {children}
                </div>
                <PublicPageFooter/>
            </TooltipProvider>
        </div>
    )
}
