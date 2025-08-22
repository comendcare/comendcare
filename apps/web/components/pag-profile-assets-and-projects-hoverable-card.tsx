"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Building, Calendar, DollarSign, FileText, GraduationCap, Link as LinkIcon, Pin, User } from "lucide-react";
import { DateView } from "./miletone-date-view";
import Link from "next/link";
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { PropertyBadge } from "./property-badge";
import { formatMoney } from "@comend/lib/utils";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { useSearchParams } from "next/navigation";
import { NoRFPs } from "./no-rfps";
import { RFPCard } from "./rfp-card";

export const PAGProfileAssetsAndRFPsHoverableCard = ({ tools, rfps, isPrivate }: { tools: any[], rfps: any[], isPrivate: boolean }) => {
    const searchParams = useSearchParams()

    if (tools && rfps) {
        return (
            <Card className="organization-profile-tour-step5">
                <CardHeader>
                    <CardTitle>RFPs</CardTitle>
                </CardHeader>
                <CardContent className="w-full max-w-full">
                    <div className="flex flex-col gap-4 w-full max-w-full">
                        {rfps.length > 0 && (
                            <ul className="w-full max-w-full flex flex-col gap-4">
                                {rfps.map((rfp, index) => (
                                    <li className="w-full max-w-full">
                                        <Dialog defaultOpen={searchParams.get("rfp") == rfp.id}>
                                            <DialogTrigger className="w-full max-w-full h-full" onClick={() => {
                                                mixpanelTrack("RFP Details Viewed", {
                                                    "ID": rfp.id,
                                                    "Name": rfp.title,
                                                    "Budget": rfp.budget,
                                                    "Linked Projects": rfp.milestones.map(({ milestone }: any) => milestone),
                                                    // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                                                    // we flatten them into a single list that can be parsed
                                                    "Linked Project Types": rfp.milestones.flatMap(({ milestone }: any) =>
                                                        (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                                                    )
                                                })
                                            }}>
                                                <RFPCard rfp={rfp} />
                                            </DialogTrigger>
                                            <DialogContent className="overflow-hidden">
                                                <RFPDetails rfp={rfp} />
                                            </DialogContent>
                                        </Dialog>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {rfps.length <= 0 && (
                            <NoRFPs isPrivate={isPrivate} />
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
}

export const AssetDetails = ({tool}: {tool: any}) => {
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

export const RFPDetails = ({rfp}: {rfp: any}) => {
    return (
        <>
        <div className="absolute top-0 w-full h-[80px] left-0 flex justify-end items-end absolute -top-px -left-px w-[calc(100%+4px)] bg-blue-light">
            <img
                src={rfp.headerImage}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center"
                }}
                className="absolute w-full"
            />
        </div>
        <ScrollArea className={"max-h-[600px] -mr-2 pr-3 pt-[80px]"}>
        <DialogHeader>
            <DialogTitle>{rfp.title}</DialogTitle>
            <DialogDescription>{rfp.description}</DialogDescription>
        </DialogHeader>
        <ul className="pt-2 w-full flex flex-col gap-2 text-sm text-wrap break-words">
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
                    <PropertyBadge icon={Calendar}>
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
        </ScrollArea>
        </>
    )
}
