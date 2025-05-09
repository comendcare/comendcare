"use client"

import { cn } from "@/lib/utils"
import { Company } from "@prisma/client"
import { ExternalLink } from "lucide-react"
import mixpanel from "mixpanel-browser"
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { mixpanelTrack } from "@/app/mixpanel"

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