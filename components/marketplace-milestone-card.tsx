import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {MILESTONE_STATUS_OPTIONS, NODE_TYPE_OPTIONS} from "@/lib/types";
import React from "react";
import {cn, formatMoney, truncate} from "@/lib/utils";
import {ProfilePhoto} from "@/components/profile-photo";
import {Separator} from "@/components/ui/separator";
import {Banknote, ExternalLink} from "lucide-react";
import {CardContents} from "@/components/private-milestone-node";
import { PublicMilestoneNode } from "./public-milestone-node";
import { NodeProps } from "@xyflow/react";
import { TypeBadge } from "./type-badge";

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
        <Link href={getLink()}>
            <Card 
                className={cn("text-wrap break-words h-full w-full flex flex-col")}
            >
                <CardHeader className="flex gap-2 pb-4">
                    <CardDescription
                        className="text-base flex flex-row justify-between items-center"
                    >
                        {organization?.name}
                        <ProfilePhoto img={organization?.image} name={organization?.name} className="size-6"/>
                    </CardDescription>
                    <Separator className="my-2"/>
                    <div className="h-fit flex flex-row align-center items-center justify-between gap-4">
                        <TypeBadge type={milestone.nodeType}/>
                        {!milestone.private && <ExternalLink className="h-[12px] w-[12px]"/>}
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 grow">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-xl">
                            {milestone.title || "New Milestone"}
                        </CardTitle>
                        <CardDescription className="text-wrap break-words line-clamp-2">
                            {truncate(milestone.description || "", 200)}
                        </CardDescription>
                    </div>
    
                    <div className="flex flex-col gap-4 justify-end grow">
                        <CardContents props={{
                            type: milestone.nodeType,
                            data: milestone
                        } as NodeProps<PublicMilestoneNode>}/>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )

    return (
        <Link
            href={getLink()}
        >
            <Card className="h-full w-full text-left flex flex-col justify-between">
                <div>
                    <CardHeader>
                        <div className="space-y-4">
                            <CardDescription
                                className="text-base flex flex-row justify-between items-center"
                            >
                                {organization?.name}
                                <ProfilePhoto img={organization?.image} name={organization?.name} className="size-6"/>
                            </CardDescription>
                            <Separator className="my-2"/>
                            <div className="flex flex-row items-center justify-between gap-4">
                                <CardTitle className="text-xl font-normal flex flex-row items-center gap-2 flex-grow">
                                    {milestone.title}
                                </CardTitle>

                                <TypeBadge className="w-fit" type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestone?.nodeType))?.value || "PROJECT"}/>
                            </div>
                        </div>

                        {status && (
                            <div
                                className={`w-fit h-8 px-2 py-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-shrink-0 ${statusStyle}`}
                            >
                                {status}
                            </div>
                        )}

                        {/*<span className="w-full flex">*/}
                        {/*    {(milestoneType) && (*/}
                        {/*        <span className="w-full flex">*/}
                        {/*            <Badge className="flex text-sm">{milestoneType}</Badge>*/}
                        {/*        </span>*/}
                        {/*    )}*/}
                        {/*</span>*/}
                    </CardHeader>

                    <CardContent className="flex flex-col items-start justify-center gap-4">
                        {/*<div className="line-clamp-3">*/}
                        {/*    {milestone.description}*/}
                        {/*</div>*/}

                        {/*{milestone.budget &&*/}
                        {/*    <div className="m-0 flex items-center">*/}
                        {/*        <Banknote className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>*/}
                        {/*        {formatMoney(milestone.budget)} budget*/}
                        {/*    </div>*/}
                        {/*}*/}
                    </CardContent>
                </div>

                {milestone.budget &&
                    <CardFooter className="justify-self-end">
                        <div className="m-0 flex items-center">
                            <Banknote className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"/>
                            {formatMoney(milestone.budget)} budget
                        </div>
                        {/*<div className="flex flex-row space-x-2">*/}
                        {/*    {[{icon: Paperclip, label: "3 Attachments"}, {*/}
                        {/*        icon: UserCheck,*/}
                        {/*        label: "2 Contacts"*/}
                        {/*    }].map(({icon: Icon, label}, idx) => (*/}
                        {/*        <div*/}
                        {/*            key={idx}*/}
                        {/*            className="w-min inline-flex flex-row justify-start items-center gap-x-2 text-base truncate rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"*/}
                        {/*        >*/}
                        {/*            <Icon className="size-4"/>*/}
                        {/*            {label}*/}
                        {/*        </div>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </CardFooter>
                }
            </Card>
        </Link>
    )
}
