import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@comend/components/ui/card";
import Link from "next/link";
import {MILESTONE_STATUS_OPTIONS, NODE_TYPE_OPTIONS, StatusType} from "@comend/lib/types";
import React from "react";
import {cn, formatMoney, truncate} from "@comend/lib/utils";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Separator} from "@comend/components/ui/separator";
import {Banknote, Calendar, ExternalLink, Lock, User} from "lucide-react";
import { TypeBadge } from "../type-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/components/ui/tooltip";
import { Badge } from "@/packages/components/ui/badge";
import { DateView } from "../miletone-date-view";
import StatusButton from "../milestone-status-button";

const StatusData: Record<"PLANNED" | "INPROGRESS" | "COMPLETED", { text: string; styling: string }> = {
    PLANNED: {
        text: "Planned",
        styling: "bg-red-100 border-red-600 text-red-800 font-semibold"
    },
    INPROGRESS: {
        text: "In Progress",
        styling: "bg-yellow-100 border-yellow-600 text-yellow-800 font-semibold"
    },
    COMPLETED: {
        text: "Completed",
        styling: "bg-green-100 border-green-600 text-green-800 font-semibold"
    }
};

export function MilestoneMarketplaceCard({milestone}: { milestone: any }) {
    const startDate = milestone.startDate ? new Date(milestone.startDate) : undefined
    const endDate = milestone.endDate ? new Date(milestone.endDate) : undefined
    const organization = milestone.organization || {};

    console.log(`milestone`, milestone)

    const getLink = () => {
        if (organization?.subdomain) {
            // if (organization.roadmaps?.filter((roadmap: any) => roadmap.id === milestone?.roadmapId).length > 0) {
            //     return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${milestone?.id}`
            // }
            //
            // return `http://${organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`

            if (organization.roadmaps?.filter((roadmap: any) => roadmap.id === milestone?.roadmapId).length > 0) {
                return `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${organization.subdomain}/research-plan?milestone=${milestone?.id}`
            }

            return `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${organization.subdomain}/research-plan?milestone=${milestone?.id}`
        }

        return '#'
    }

    const status = MILESTONE_STATUS_OPTIONS.find((option) => option.value === milestone.status)?.label;

    const statusKey = milestone.status as keyof typeof StatusData;
    const statusStyle = StatusData[statusKey]?.styling || "bg-gray-100 text-gray-800";

    return (
        // <Link href={getLink()}>
        <Card>
            <CardHeader className="py-4">
                <CardTitle className="text-gray-900">
                    {milestone.title || "New Milestone"}
                    {milestone.private && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Lock size={20} className="inline-block align-middle ml-2 mb-1"/>
                            </TooltipTrigger>
                            <TooltipContent className="font-normal">
                                {`Only visible to your team`}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {truncate(milestone.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <ul className="w-full flex flex-row flex-wrap gap-2 text-sm text-wrap break-words">
                    {(milestone.types || []).sort((a: any, b: any) => a?.milestoneType?.label && b?.milestoneType?.label ? a?.milestoneType?.label.length - b?.milestoneType?.label.length : 0).map((milestoneType, index) => (
                        <li key={index}>
                            <Badge className="w-fit">
                                {milestoneType?.milestoneType?.label || "No type"}
                            </Badge>
                        </li>
                    ))}

                    {(milestone.contacts || []).map((contact: any, index: number) => {
                        if (contact.affiliation) {
                            return (
                                <li key={index}>
                                    <Badge>
                                        <User size={18}/>
                                        <p className="w-[90%] text-wrap break-words">{contact.affiliation}</p>
                                    </Badge>
                                </li>
                            )
                        }
                    })}

                    {(milestone.startDate || milestone.endDate) && (
                        <li>
                            <Badge>
                                <Calendar size={16}/>
                                <DateView startDate={milestone.startDate || undefined} endDate={milestone.endDate || undefined}/>
                            </Badge>
                        </li>
                    )}
                </ul>

                {/* <StatusButton 
                    status={milestone.status as StatusType || undefined}
                    minimal={true}
                    disabled={true}
                    onStatusChange={() => {}}
                /> */}

                {/* {(milestone.biosamples?.length > 0 || props.data?.diseaseModels?.length > 0 || props.data?.tools?.length > 0 || props.data?.rfps?.length > 0) && (
                    <>
                    <Separator className="bg-gray-300 h-[2px] rounded-full my-4"/>
                        {(props.data?.biosamples?.length > 0 || props.data?.diseaseModels?.length > 0 || props.data?.tools?.length > 0) && (
                            <div className="border-l-4 border-emerald-200 pl-4 space-y-3">
                                <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Microscope className="h-4 w-4 min-w-4 text-emerald-900" />
                                    <span className="text-emerald-900 text-nowrap">Linked Tools</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(props.data?.biosamples || []).map(({biosample}) => {
                                        const type = BIOSAMPLE_TYPE_OPTIONS.find(option => option.value === biosample.types[0])
                                        return (
                                            <Badge variant="violet">
                                                {`${biosample.donorId} --- ${type?.label || ''}`}
                                            </Badge>
                                        )
                                    })}
                                    {(props.data?.diseaseModels || []).map(({diseaseModel}) => {
                                        const type = DISEASE_MODEL_TYPE_OPTIONS.find(option => option.value === diseaseModel.types[0])
                                        return (
                                            <Badge variant="yellow">
                                                {`${diseaseModel.id} --- ${type?.label}`}
                                            </Badge>
                                        )
                                    })}
                                    {(props.data?.tools || []).map(({tool}) => (
                                        <Badge variant="emerald">
                                            {tool?.title}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {props.data?.rfps?.length > 0 && (
                            <div className="border-l-4 border-orange-200 pl-4 space-y-3">
                                <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Megaphone className="h-4 w-4 min-w-4 text-orange-900" />
                                    <span className="text-orange-900 text-nowrap">Linked RFPs</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {props.data?.rfps.map(({rfp}) => (
                                        <Badge variant="orange">
                                            {rfp?.title}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )} */}
            </CardContent>
        </Card>
        // </Link>
    )
}
