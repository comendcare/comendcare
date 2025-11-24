"use client"

import { cn } from "@comend/lib/utils"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@comend/components/ui/button"
import { mixpanelTrack } from "@comend/lib/mixpanel"

export const ServiceProviderWebsiteButton = ({
    cro
}: {
    cro: any
}) => {
    return (
        <Link
            onClick={() => mixpanelTrack("Service Provider Website Visited", {
                "Service Provider ID": cro.id,
                "Service Provider Name": cro.title,
                "URL": cro.url,
                "Average Rating": cro.avgRating,
                "Number of Reviews": cro.reviews.length
            })}
            href={cro.url || ""}
            className={cn(buttonVariants({variant: "secondary"}), "w-fit")}
            target="_blank"
            rel="noreferrer"
        >
            <ExternalLink className="h-4 w-4"/>
            Visit website
        </Link>
    )
}
