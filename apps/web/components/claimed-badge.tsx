"use client"

import { useEffect, useState } from "react"
import { CheckCircleIcon } from "lucide-react"
import { Badge } from "@comend/components/ui/badge"
import {getIsOrganizationClaimed} from "comend-admin-dashboard/lib/fetchers";

type ClaimedBadgeProps = {
    organizationId?: string | null
}

const ClaimedBadge = ({ organizationId }: ClaimedBadgeProps) => {
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

    return (
        <Badge
            variant="outline"
            className="rounded-sm border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 [a&]:hover:bg-green-600/10 [a&]:hover:text-green-600/90 dark:[a&]:hover:bg-green-400/10 dark:[a&]:hover:text-green-400/90"
        >
            <CheckCircleIcon className="size-3 mr-1" />
            Claimed
        </Badge>
    )
}

export default ClaimedBadge
