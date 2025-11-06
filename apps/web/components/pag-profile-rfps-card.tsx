"use client"

import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import {Calendar, DollarSign, FileText, Link as LinkIcon, School, User, Clock, ChevronDown, ChevronRight, Mail, Workflow, ExternalLink} from "lucide-react";
import Link from "next/link";
import {ScrollArea} from "@comend/components/ui/scroll-area";
import {PropertyBadge} from "./property-badge";
import {checkDateRangeUTC, cn, formatDateUTC, formatMoney, RFPSort} from "@comend/lib/utils";
import {mixpanelTrack} from "@comend/lib/mixpanel";
import {useSearchParams} from "next/navigation";
import {NoRFPs} from "./no-rfps";
import {RFPCard, RFPStatusBadge} from "./rfp-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    CarouselApi
} from "@/packages/components/ui/carousel";
import {Badge} from "@/packages/components/ui/badge";
import { ExternalAttachment, ExternalContact, Milestone } from "@prisma/client";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { Button } from "@/packages/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ProfilePhoto } from "@/packages/components/profile-photo";
import { Separator } from "@/packages/components/ui/separator";

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
                                    {rfps.map((rfp: any, index: number) => (
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
            </DialogHeader>

            <ul className="pt-2 w-full flex flex-col gap-2 text-sm text-wrap break-words">
                {(tool.milestones || []).map((milestone: any, index: number) => {
                    return (
                        <li key={index}>
                            <PropertyBadge 
                                // icon={FileText}
                            >
                                <p className="text-wrap break-words">{milestone.milestone.title}</p>
                            </PropertyBadge>
                        </li>
                    )
                })}

                {(tool.contacts || []).map((contact: any, index: number) => {
                    return (
                        <li key={index}>
                            <PropertyBadge 
                                // icon={User}
                            >
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
                            <PropertyBadge 
                                // icon={LinkIcon}
                            >
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
    const status = useMemo(() => checkDateRangeUTC(rfp.startDate, rfp.endDate), [rfp.startDate, rfp.endDate]);

    return (
        <ScrollArea className={"max-h-[80vh] -mr-2 pr-3 mt-2"} type={"always"}>
            <Scrollbar />
            <DialogHeader>
                <div className="flex gap-2 justify-center items-center flex-wrap">
                    <DialogTitle className="text-2xl font-semibold">{rfp.title}</DialogTitle>
                    {(rfp?.contacts && rfp?.contacts?.length > 0) && (
                        <Button 
                            variant="cta"
                            className="ml-auto font-normal"
                            asChild
                        >
                            <Link href={`mailto:${rfp.contacts[0].email}`}>
                                <Mail className="h-4 w-4 min-h-4 min-w-4"/>
                                Contact
                            </Link>
                        </Button>
                    )}
                </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4 ">
                <RFPStatusBadge status={status} />
                
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {Array.isArray(rfp.openTo) && rfp.openTo.length > 0 && (
                        <li>
                            <PropertyBadge>
                                <b>Open to:</b>
                                {rfp.openTo
                                    .map((option: string) => {
                                        switch (option) {
                                            case "CRO":
                                                return "Service providers";
                                            case "ACADEMIC":
                                                return "Academics";
                                            default:
                                                return option;
                                        }
                                    })
                                    .join(", ")}
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.budget && (
                        <li>
                            <PropertyBadge>
                                <p><b>Budget: </b> ${formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.startDate && (
                        <li>
                            <PropertyBadge>
                                <b>Opens: </b>{formatDateUTC(rfp.startDate)}
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.endDate && (
                        <li>
                            <PropertyBadge>
                                <b>Due: </b>{formatDateUTC(rfp.endDate)}
                            </PropertyBadge>
                        </li>
                    )}
                </ul>

                {(rfp.milestones && rfp.milestones.length > 0) && (
                    <div className="border-l-2 border-purple-200 pl-2 space-y-2">
                        <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Workflow className="h-4 w-4 min-w-4 text-purple-900" />
                            <span className="text-purple-900 text-nowrap">Projects</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {rfp.milestones.map((project: any) => (
                                <Badge className="font-normal" variant={"purple"}>
                                    <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                                    {project.milestone.title}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <DialogDescription className="text-sm text-muted-foreground">{rfp.description}</DialogDescription>

                <Separator />

                {rfp.organization && (
                    <a
                        href={`http://${rfp.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                    >
                        <div className="flex flex-row gap-2 items-center">
                            <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name} className="h-9 w-9 -mt-1"/>
                            <p className="text-lg font-semibold underline">{rfp.organization.name}</p>
                        </div>
                    </a>
                )}

                <Separator />

                {rfp.eligibility && (
                    <CaretAccordion 
                        title={'Eligibility'}
                        content={
                            <p className="text-sm">{rfp.eligibility}</p>
                        }
                    />
                )}

                {rfp.instructions && (
                    <CaretAccordion 
                        title={'Instructions'}
                        content={
                            <p className="text-sm">{rfp.instructions}</p>
                        }
                    />
                )}

                {rfp.evaluationProcess && (
                    <CaretAccordion 
                        title={'Evaluation process'}
                        content={
                            <p className="text-sm">{rfp.evaluationProcess}</p>
                        }
                    />
                )}

                {((rfp.contacts && rfp.contacts.length > 0) || (rfp.attachments && rfp.attachments.length > 0)) && <Separator />}

                {rfp.contacts && rfp.contacts.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Contacts</h3>
                        {rfp?.contacts?.map((contact: ExternalContact) => (
                            <span className="flex items-center gap-2 text-wrap w-full text-sm">
                                <Mail className="mt-1 h-4 w-4 min-h-4 min-w-4"/>
                                <a
                                    className={cn(contact?.email && "underline")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    href={contact?.email ? `mailto:${contact?.email}` : undefined}
                                >
                                    {contact?.name ||
                                        contact?.email ||
                                        contact?.affiliation || "No primary contacts"}
                                </a>
                            </span>
                        ))}
                    </div>
                )}

                {rfp.attachments && rfp.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-semibold">Attachments</h3>
                        {rfp?.attachments?.map((attachment: ExternalAttachment) => (
                            <span className="flex items-start gap-2 text-wrap w-full text-sm">
                                <LinkIcon className="mt-1 h-4 w-4 min-h-4 min-w-4"/>
                                <a
                                    className={cn(
                                        attachment?.link && "underline", 
                                        "text-wrap w-full",
                                        // allow text break in middle of word for long links
                                        !attachment.name && attachment.link && "break-all"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    href={attachment?.link}
                                >
                                    {attachment?.name || attachment?.link || "No attachments"}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}

const CaretAccordion = ({title, content, className}: {title: string, content: React.ReactNode, className?: string}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn("flex flex-col gap-2", className)} >
            <span className="flex gap-2 items-center">
                <Button 
                    variant={'ghost'} 
                    className="p-0 h-6 w-6"
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {isOpen ? (
                        <ChevronDown />
                    ) : (
                        <ChevronRight />
                    )}
                </Button>
                <p className="text-xl font-semibold">{title}</p>
            </span>
            {isOpen && (
                <div>
                    {content}
                </div>
            )}
        </div>
    )
}

