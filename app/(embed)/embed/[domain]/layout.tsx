import {ReactNode} from "react"
import {notFound} from "next/navigation"
import {getOrganizationData} from "@/lib/fetchers"
import {fontMapper} from "@/styles/fonts"
import {TooltipProvider} from "@radix-ui/react-tooltip"
import {PublicPageNavbar} from "@/components/public-page-navbar";
import { ComendEmbedBanner } from "@/components/comend-embed-banner"

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

    return (
        <div className={fontMapper[data.font]}>
            <TooltipProvider>
                <PublicPageNavbar/>
                <div>
                    {children}
                </div>
                <ComendEmbedBanner />
            </TooltipProvider>
        </div>
    )
}