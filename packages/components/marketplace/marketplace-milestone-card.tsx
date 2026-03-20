import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@comend/components/ui/card";
import Link from "next/link";
import {MILESTONE_STATUS_OPTIONS, NODE_TYPE_OPTIONS, StatusType} from "@comend/lib/types";
import React from "react";
import {formatMoney} from "@comend/lib/utils";
import {ProfilePhoto} from "@comend/components/profile-photo";
import {Separator} from "@comend/components/ui/separator";
import {Banknote, DollarSign, Microscope, User} from "lucide-react";
import { TypeBadge } from "@comend/components/type-badge";
import { Badge } from "@comend/components/ui/badge";
import { DateView } from "@comend/components/milestone-date-view"
import StatusButton from "@comend/components/milestone-status-button"

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
            {/* <Card 
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
                </CardContent>
            </Card> */}

            <Card 
                // className={cn(
                //     "drag-handle border-2 border-gray-300 w-[350px] text-wrap",
                //     props?.id && selectedNodeIds.includes(props?.id) ? "border-gray-900 border-2 click-project-step" : "",
                //     props.id === "preview" ? "opacity-50" : "",
                // )}
                // style={{
                //     // transform the node so the 'snap to grid' point is centered in the node
                //     // this allows edges to be straight, and perfectly align handles no matter the node's card height
                //     transform: props.id === 'preview' ? 'translate(0%, 50%)' : 'translate(0%, -50%)',
                // }}
            >
                <CardHeader className="pt-8">
                    <CardTitle className="text-gray-900">
                        {milestone?.title || "New Milestone"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <ul className="w-full flex flex-row flex-wrap gap-2 text-sm text-wrap break-words">
                        {(milestone?.types || []).sort((a: any, b: any) => a?.milestoneType?.label && b?.milestoneType?.label ? a?.milestoneType?.label.length - b?.milestoneType?.label.length : 0).map((milestoneType: any, index: number) => (
                            <li key={index}>
                                <Badge className="w-fit" variant={'lightBlue'}>
                                    {milestoneType?.milestoneType?.label || "No type"}
                                </Badge>
                            </li>
                        ))}

                        {(milestone?.contacts || []).map((contact: any, index: number) => {
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

                        {(milestone?.startDate || milestone?.endDate) && (
                            <li>
                                <Badge>
                                    <DateView startDate={milestone?.startDate || undefined} endDate={milestone?.endDate || undefined}/>
                                </Badge>
                            </li>
                        )}

                        {(!!milestone?.budget) && (
                            <li>
                                <Badge>
                                    <DollarSign size={16}/>
                                    <p>{formatMoney(milestone?.budget)}</p>
                                </Badge>
                            </li>
                        )}

                        {(milestone?.biosamples?.length > 0 || milestone?.diseaseModels?.length > 0 || milestone?.tools?.length > 0) && (
                            <li>
                                <Badge variant={'green'}>
                                    <Microscope size={16} />
                                    {(milestone?.biosamples?.length + milestone?.diseaseModels?.length + milestone?.tools?.length) <= 1 
                                        ? `1 Linked tool` 
                                        : `${(milestone?.biosamples?.length + milestone?.diseaseModels?.length + milestone?.tools?.length)} Linked tools`}
                                </Badge>
                            </li>
                        )}

                        {(milestone?.rfps?.length > 0) && (
                            <li>
                                <Badge variant={'orange'}>
                                    <Microscope size={16} />
                                    {(milestone?.rfps?.length) <= 1 
                                        ? `1 Linked RFP` 
                                        : `${(milestone?.rfps?.length)} Linked RFPs`}
                                </Badge>
                            </li>
                        )}
                    </ul>

                    <StatusButton 
                        status={milestone?.status as StatusType || undefined}
                        minimal={true}
                        disabled={true}
                        onStatusChange={() => {}}
                    />
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
