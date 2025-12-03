import {ReactNode} from "react"
import {notFound, redirect} from "next/navigation"
import {getOrganizationData} from "@comend/lib/fetchers"
import {Metadata} from "next"
import PublicPageFooter from "~web/components/public-page-footer"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {PublicPageNavbarLoginOnly} from "~web/components/public-page-navbar-login-only";
import PublicPageBottomBanner from "~web/components/public-page-bottom-banner";

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
        title: data.name ? `${data.name} - Comend` : title,
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
            // icon: logo ? [logo] : '/icon.ico',
            icon: '/icon.ico',
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
        <>
        <link 
            rel="icon" 
            // href={data.image ? data.image :  "/icon.ico"}
            href={"/icon.ico"}
            sizes="any" 
        />
        <div>
            <TooltipProvider>
                {/* <StickyBanner className="bg-blue-light flex-row space-x-4">
                    <p className="mx-0 max-w-[90%] text-black drop-shadow-md">
                        Announcing $10M seed funding from project mayhem ventures.{" "}
                        <a href="#" className="transition duration-200 hover:underline">
                            Read announcement
                        </a>
                    </p>
                    <Button
                        className="w-fit ml-2 inline-block rounded-full bg-blue-dark px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                        asChild
                    >
                        <Link href={"https://calendly.com/albertatcomend/onboarding"}>
                            Sign up <span aria-hidden="true">&rarr;</span>
                        </Link>
                    </Button>
                </StickyBanner> */}
                <PublicPageNavbarLoginOnly/>
                {children}
                <PublicPageBottomBanner/>
                <PublicPageFooter/>
            </TooltipProvider>
        </div>
        </>
    )
}
