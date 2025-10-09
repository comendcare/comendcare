"use client"

import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {Building, Calendar, DollarSign, FileText, GraduationCap, Link as LinkIcon, Pin, User} from "lucide-react";
import {DateView} from "./miletone-date-view";
import Link from "next/link";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {PropertyBadge} from "./property-badge";
import {cn, formatMoney} from "@comend/lib/utils";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import {useSearchParams} from "next/navigation";
import {NoRFPs} from "./no-rfps";
import {RFPCard} from "./rfp-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    CarouselApi
} from "@/packages/components/ui/carousel";
import {Badge} from "@/packages/components/ui/badge";

export const PAGProfileRFPsHoverableCard = ({rfps, isPrivate}: { rfps: any[], isPrivate: boolean }) => {
    const searchParams = useSearchParams()

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) return

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    if (rfps) {
        return (
            <Card className="organization-profile-tour-step5" data-testid="rfps-card">
                <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle data-testid="rfps-heading">
                        Requests for proposals
                    </CardTitle>
                    <div className="text-muted-foreground text-sm" data-testid="rfps-count">
                        {current} of {count}
                    </div>
                </CardHeader>
                <CardContent className="w-full max-w-full px-16">
                    {rfps.length > 0
                        ? (
                            <Carousel opts={{loop: true}} setApi={setApi} className="w-full">
                                <CarouselContent>
                                    {rfps.map((rfp, index) => (
                                        <CarouselItem key={index}>
                                            <div className="h-full p-1">
                                                <Dialog defaultOpen={searchParams.get("rfp") == rfp.id}>
                                                    <DialogTrigger
                                                        className="w-full max-w-full h-full"
                                                        onClick={() => {
                                                            mixpanelTrack("RFP Details Viewed", {
                                                                "ID": rfp.id,
                                                                "Name": rfp.title,
                                                                "Budget": rfp.budget,
                                                                "Linked Projects": rfp.milestones.map(({milestone}: any) => milestone),
                                                                // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                                                                // we flatten them into a single list that can be parsed
                                                                "Linked Project Types": rfp.milestones.flatMap(({milestone}: any) =>
                                                                    (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                                                                )
                                                            })
                                                        }}
                                                        data-testid="rfp-card-trigger"
                                                    >
                                                        <RFPCard rfp={rfp}/>
                                                    </DialogTrigger>
                                                    <DialogContent className="overflow-hidden" data-testid="dialog">
                                                        <RFPDetails rfp={rfp}/>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious/>
                                <CarouselNext/>
                            </Carousel>
                        )
                        : (<NoRFPs isPrivate={isPrivate}/>)
                    }
                </CardContent>
            </Card>
        );
    }
}

export const AssetDetails = ({tool}: { tool: any }) => {
    return (
        <ScrollArea className={"max-h-[600px] -mr-2 pr-3"}>
            <DialogHeader>
                <DialogTitle>{tool.title}</DialogTitle>
                <DialogDescription>{tool.description}</DialogDescription>
            </DialogHeader>

            <ul className="pt-2 w-full flex flex-col gap-2 text-sm text-wrap break-words">
                {(tool.milestones || []).map((milestone: any, index: number) => {
                    return (
                        <li key={index}>
                            <PropertyBadge icon={FileText}>
                                <p className="text-wrap break-words">{milestone.milestone.title}</p>
                            </PropertyBadge>
                        </li>
                    )
                })}

                {(tool.contacts || []).map((contact: any, index: number) => {
                    return (
                        <li key={index}>
                            <PropertyBadge icon={User}>
                                <p className="text-wrap break-words">
                                    {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                                </p>
                            </PropertyBadge>
                        </li>
                    )
                })}

                {(tool.attachments || []).map((attachment: any, index: number) => {
                    return (
                        <li key={index}>
                            <PropertyBadge icon={LinkIcon}>
                                <Link
                                    target="_blank"
                                    className="text-wrap break-words underline"
                                    href={attachment.link || "#"}
                                >
                                    {attachment.name || attachment.link}
                                </Link>
                            </PropertyBadge>
                        </li>
                    )
                })}
            </ul>
        </ScrollArea>
    )
}

export const RFPDetails = ({rfp}: { rfp: any }) => {
    return (
        <>
            {/*<div*/}
            {/*    className="absolute top-0 w-full h-[80px] left-0 flex justify-end items-end absolute -top-px -left-px w-[calc(100%+4px)] bg-blue-light">*/}
            {/*    <img*/}
            {/*        src={rfp.headerImage}*/}
            {/*        style={{*/}
            {/*            width: "100%",*/}
            {/*            height: "100%",*/}
            {/*            objectFit: "cover",*/}
            {/*            objectPosition: "center"*/}
            {/*        }}*/}
            {/*        className="absolute w-full"*/}
            {/*    />*/}
            {/*</div>*/}
            <ScrollArea className="max-h-[600px] -mr-2 pr-3">
                <DialogHeader>
                    <DialogTitle>{rfp.title}</DialogTitle>
                    <DialogDescription>{rfp.description}</DialogDescription>
                </DialogHeader>
                <ul className="pt-4 w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {(rfp.milestones || []).map((milestone: any, index: number) => {
                        return (
                            <li key={index}>
                                <PropertyBadge icon={FileText}>
                                    <p className="text-wrap break-words">{milestone.milestone.title}</p>
                                </PropertyBadge>
                            </li>
                        )
                    })}

                    {(rfp.budget) && (
                        <li>
                            <PropertyBadge icon={DollarSign}>
                                <p>{formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {(rfp.startDate || rfp.endDate) && (
                        <li>
                            <PropertyBadge>
                                <DateView
                                    specific={true}
                                    startDate={rfp.startDate || undefined}
                                    endDate={rfp.endDate || undefined}
                                    startLabel="Request Opens:"
                                    endLabel="Deadline for Proposals:"
                                />
                            </PropertyBadge>
                        </li>
                    )}

                    {(rfp.contacts || []).map((contact: any, index: number) => {
                        return (
                            <li key={index}>
                                <PropertyBadge icon={User}>
                                    <p className="text-wrap break-words">
                                        {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                                    </p>
                                </PropertyBadge>
                            </li>
                        )
                    })}

                    {(rfp.attachments || []).map((attachment: any, index: number) => {
                        return (
                            <li key={index}>
                                <PropertyBadge icon={LinkIcon}>
                                    <Link
                                        target="_blank"
                                        className="text-wrap break-words underline"
                                        href={attachment.link || "#"}
                                    >
                                        {attachment.name || attachment.link}
                                    </Link>
                                </PropertyBadge>
                            </li>
                        )
                    })}

                    {rfp.openTo && rfp.openTo.includes('ACADEMIC') && (
                        <li>
                            <PropertyBadge icon={GraduationCap}>
                                <p>Open to Academics</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.openTo && rfp.openTo.includes('CRO') && (
                        <li>
                            <PropertyBadge icon={Building}>
                                <p>Open to Service Providers</p>
                            </PropertyBadge>
                        </li>
                    )}
                </ul>

                <div className="pt-4 flex flex-row w-full gap-4">
                    <Badge variant={"secondary"} className="p-2 flex flex-col items-start justify-start w-full text-sm">
                        <p className="font-normal">Organization: </p>
                        <p>{rfp?.organization?.name || "No organization"}</p>
                    </Badge>

                    <Badge variant={"secondary"} className="p-2 flex flex-col items-start justify-start w-full text-sm">
                        <p className="font-normal">Primary Attachment: </p>
                        <a
                            className={cn(rfp?.attachments?.[0]?.link && "underline")}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            href={rfp?.attachments?.[0]?.link}
                        >
                            {rfp?.attachments?.[0]?.name || rfp?.attachments?.[0]?.link || "No attachments"}
                        </a>
                    </Badge>

                    <Badge variant={"secondary"} className="p-2 flex flex-col items-start justify-start w-full text-sm">
                        <p className="font-normal">Primary Contact: </p>
                        <a
                            className={cn(rfp?.contacts?.[0]?.email && "underline")}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            href={rfp?.contacts?.[0]?.email ? `mailto:${rfp?.contacts[0]?.email}` : undefined}
                        >
                            {rfp?.contacts?.[0]?.name ||
                                rfp?.contacts?.[0]?.email ||
                                rfp?.contacts?.[0]?.affiliation || "No primary contacts"}
                        </a>
                    </Badge>
                </div>
            </ScrollArea>
        </>
    )
}
