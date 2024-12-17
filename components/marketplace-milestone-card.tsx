import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types";
import { Badge } from "./ui/badge";
import { DateView } from "./miletone-date-view";
import { getOrganizationFromOrganizationId, getOrganizationFromRoadmapId } from "@/lib/fetchers";
import { useEffect, useState } from "react";

export function MilestoneMarketplaceCard({ milestone }: { milestone: any }) {
    const startDate = milestone.startDate ? new Date(milestone.startDate) : undefined
    const endDate = milestone.endDate ? new Date(milestone.endDate) : undefined
    const [organization, setOrganization] = useState<any>()

    useEffect(() => {
        const initOrg = async () => {
            const organizationId = await getOrganizationFromRoadmapId(milestone.roadmapId)
            if (organizationId.success) {
                const response = await getOrganizationFromOrganizationId(organizationId?.data)
                if (response.success) setOrganization(response.data)
            }
        }

        if (!organization) initOrg()
    }, [])

    const getLink = () => {
        if (organization?.subdomain) {
            if (organization.roadmaps?.filter((roadmap: any) => roadmap.id === milestone?.roadmapId).length > 0) {
                return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/roadmap/?milestone=${milestone?.id}&view=flow`
            }

            return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/roadmap`
        }

        return '#'
    }

    return (
        <Link
            // href={
            //     organization?.subdomain ? 
            //     // `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/roadmap/?milestone=${milestone?.roadmapId}&view=flow` :
            //     `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/roadmap` :
            //     '#'
            // }
            href={getLink()}
        >
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader>
                <CardTitle className="flex flex-row gap-2 items-center">
                    {milestone.title}
                </CardTitle>
                <CardDescription>{milestone.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                <span className="w-full flex">
                    <Badge className="flex text-sm">
                        {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === milestone.type))?.label || "No type"}
                    </Badge>
                </span>
                
                {(startDate?.getMonth() || endDate?.getFullYear()) && (
                    <DateView startDate={startDate} endDate={endDate}/>
                )}
            </CardContent>
        </Card>
        </Link>
    )
}