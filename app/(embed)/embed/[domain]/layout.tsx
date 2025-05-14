import Image from "next/image"
import Link from "next/link"
import {ReactNode} from "react"
import {notFound, redirect} from "next/navigation"
import {getOrganizationData} from "@/lib/fetchers"
import {fontMapper} from "@/styles/fonts"
import {Metadata} from "next"
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";
import PublicPageFooter from "@/components/public-page-footer"
import {Button} from "@/components/ui/button"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {PublicPageNavbar} from "@/components/public-page-navbar";

export default async function EmbedLayout({
    params,
    children
}: {
    params: { domain: string }
    children: ReactNode
}) {
    const domain = decodeURIComponent(params.domain)
    const data = await getOrganizationData(domain)

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
        <div className={fontMapper[data.font]}>
            <TooltipProvider>
                <PublicPageNavbar/>
                <div>
                    {children}
                </div>
            </TooltipProvider>
        </div>
    )
}