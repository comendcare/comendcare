import {ReactNode} from "react"
import {notFound, redirect} from "next/navigation"
import {getOrganizationData} from "@comend/lib/fetchers"
import {Metadata} from "next"
import PublicPageFooter from "~web/components/public-page-footer"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {headers} from "next/headers";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function getOrigin() {
    const h = headers();
    const host = h.get('x-forwarded-host') ?? h.get('host')!;
    const proto = h.get('x-forwarded-proto') ?? 'https';
    return `${proto}://${host}`;
}

const toAbs = (u?: string | null, origin?: string) =>
    u ? (u.startsWith('http') ? u : new URL(u, origin!).toString()) : undefined;


export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string }
}): Promise<Metadata | null> {
    const origin = getOrigin()
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

    const title = data.name ?? 'Comend';
    const description = data.description ?? '';

    // absolute assets
    const ogImage = toAbs(data.image, origin);
    const iconUrl = toAbs(data.logo, origin);

    // canonical: prefer custom domain if you’re on a subdomain
    const isOnSubdomain =
        domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? ''}`);
    const canonical =
        isOnSubdomain && data.customDomain
            ? `https://${data.customDomain}`
            : origin;

    return {
        title,
        description,
        metadataBase: new URL(origin),

        alternates: { canonical },

        openGraph: {
            type: 'website',
            title,
            description,
            url: canonical,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : undefined,
            creator: '@comendcare',
        },
        icons: iconUrl
            ? {
                icon: [{ url: iconUrl }],
            }
            : undefined,
    };
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
