import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS} from "@/lib/types";
import {Badge} from "./ui/badge";
import {DateView} from "./miletone-date-view";
import {getOrganizationFromOrganizationId, getOrganizationFromRoadmapId} from "@/lib/fetchers";
import {useEffect, useState} from "react";
import {FaMoneyBill} from "react-icons/fa6";

export function MilestoneMarketplaceCard({milestone}: { milestone: any }) {
    const startDate = milestone.startDate ? new Date(milestone.startDate) : undefined
    const endDate = milestone.endDate ? new Date(milestone.endDate) : undefined
    const organization = milestone.organization || {};
    console.log(milestone)
    // const [organization, setOrganization] = useState<any>()
    //
    // useEffect(() => {
    //     const initOrg = async () => {
    //         const organizationId = await getOrganizationFromRoadmapId(milestone.roadmapId)
    //         if (organizationId.success) {
    //             const response = await getOrganizationFromOrganizationId(organizationId?.data)
    //             if (response.success) setOrganization(response.data)
    //         }
    //     }
    //
    //     if (!organization) initOrg()
    // }, [])

    const getLink = () => {
        if (organization?.subdomain) {
            if (organization.roadmaps?.filter((roadmap: any) => roadmap.id === milestone?.roadmapId).length > 0) {
                return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${milestone?.id}&view=flow`
            }

            return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`
        }

        return '#'
    }

    const milestoneType = MILESTONE_TYPE_OPTIONS.find((option) => option.value === milestone.type)?.label;
    const status = MILESTONE_STATUS_OPTIONS.find((option) => option.value === milestone.status)?.label;

    return (
        <Link
            href={getLink()}
        >
            <Card className="h-full w-full text-left flex flex-col justify-between">
                <CardHeader>
                    <CardDescription
                        className="text-base"
                    >
                        {organization?.name}
                    </CardDescription>
                    <CardTitle className="text-xl font-normal flex flex-row gap-2 items-center">
                        {milestone.title}
                    </CardTitle>
                    <span className="w-full flex">
                        {(milestoneType && milestoneType !== "No type") && (
                            <span className="w-full flex">
                                <Badge className="flex text-sm">{milestoneType}</Badge>
                            </span>
                        )}
                    </span>
                    <span className="w-full flex">
                        {milestoneType && (
                            <span className="w-full flex">
                                <div
                                    className="h-10 px-4 py-2 bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-red-100 border-red-600 text-red-800 disabled:opacity-100">{status}</div>
                            </span>
                        )}
                    </span>
                </CardHeader>
                <CardContent className="flex flex-col items-start justify-center space-y-4 gap-8">
                    <div className="line-clamp-3">
                        {milestone.description}
                    </div>

                    <div className="w-full grid gap-4 grid-cols-2">
                        {(startDate?.getMonth() || endDate?.getFullYear()) && (
                            <DateView startDate={startDate} endDate={endDate}/>
                        )}
                        {milestone.budget &&
                            <div className="m-0 flex items-center">
                                <FaMoneyBill className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                                {milestone.budget}
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}