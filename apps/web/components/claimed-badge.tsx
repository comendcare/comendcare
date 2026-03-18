"use client"

import { useEffect, useState } from "react"
import { CheckCircleIcon } from "lucide-react"
import { Badge } from "@comend/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@comend/components/ui/tooltip"
import { Organization, Prisma } from "@prisma/client"
import { cn } from "@comend/lib/utils"

type ClaimedBadgeProps = {
    organization: Prisma.OrganizationGetPayload<{include: {members: true}}>,
    mini?: boolean,
    className?: string,
}

const ClaimedBadge = ({ organization, mini = false, className }: ClaimedBadgeProps) => {
    const claimed = (organization.members || []).filter(member => !member.email.includes("@comendcare.com")).length > 0
    if (!claimed) return null

    const content = mini ? (
        <CheckCircleIcon
            className={cn("size-3 mr-1 text-green-600 dark:text-green-400", className)}
        />
    ) : (
        <Badge
            variant="outline"
            className={cn("rounded-sm border-green-600 text-green-600 dark:border-green-400 dark:text-green-400", className)}
        >
            <CheckCircleIcon className="size-3 mr-1" />
            Claimed
        </Badge>
    )

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex">{content}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-56">
                Claimed organizations have at least one member from the organization signed up and on Comend.
            </TooltipContent>
        </Tooltip>
    )
}

export default ClaimedBadge
