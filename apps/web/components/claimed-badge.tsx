"use client"

import { useEffect, useState } from "react"
import { CheckCircleIcon } from "lucide-react"
import { Badge } from "@comend/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@comend/components/ui/tooltip"
import { getIsOrganizationClaimed } from "comend-admin-dashboard/lib/fetchers"

type ClaimedBadgeProps = {
    organizationId?: string | null
    mini?: boolean
}

const ClaimedBadge = ({ organizationId, mini = false }: ClaimedBadgeProps) => {
    const [claimed, setClaimed] = useState(false)

    useEffect(() => {
        let cancelled = false

        if (!organizationId) {
            setClaimed(false)
            return
        }

        ;(async () => {
            const res = await getIsOrganizationClaimed(organizationId)
            if (!cancelled) setClaimed(Boolean(res))
        })()

        return () => {
            cancelled = true
        }
    }, [organizationId])

    if (!claimed) return null

    const content = mini ? (
        <CheckCircleIcon
            className="size-3 mr-1 text-green-600 dark:text-green-400"
        />
    ) : (
        <Badge
            variant="outline"
            className="rounded-sm border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
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
            <TooltipContent>
                Claimed organizations have at least one member from the organization signed up and on Comend.
            </TooltipContent>
        </Tooltip>
    )
}

export default ClaimedBadge
