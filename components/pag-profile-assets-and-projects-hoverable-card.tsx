"use client"
import {Card, CardContent} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import { RFPCard } from "./rfp-card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Building, Calendar, DollarSign, FileText, GraduationCap, Link as LinkIcon, Pin, User } from "lucide-react";
import { DateView } from "./miletone-date-view";
import { PrivateBadge } from "./private-badge";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";
import { PropertyBadge } from "./property-badge";
import { PrivateNoPinnedAssets, PublicNoPinnedAssets } from "./no-pinned-assets";
import { PrivateNoPinnedRFPs, PublicNoPinnedRFPs } from "./no-pinned-rfps";
import { formatMoney } from "@/lib/utils";
import mixpanel from "mixpanel-browser";
import { mixpanelTrack } from "@/app/mixpanel";
import { useSearchParams } from "next/navigation";

export const PAGProfileAssetsAndRFPsHoverableCard = ({ tools, rfps, isPrivate }: { tools: any[], rfps: any[], isPrivate: boolean }) => {
    const searchParams = useSearchParams()

    if (tools && rfps) {
        return (
            <Card className="organization-profile-tour-step5">
                <CardContent className="mt-8">
                    <Tabs defaultValue="rfps" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="rfps">Requests for Proposals</TabsTrigger>
                            <TabsTrigger value="tools">Tools</TabsTrigger>
                        </TabsList>
                        <TabsContent value="rfps">
                            {rfps.filter(rfp => rfp.pinned).length > 0 && (
                                <div className="w-full px-8">
                                    <Carousel className="w-full" opts={{loop: true, align: "start"}}>
                                        <CarouselContent>
                                            {rfps.filter(rfp => rfp.pinned).map((rfp, index) => (
                                                <CarouselItem key={index} className="lg:basis-1/2">
                                                    <Dialog defaultOpen={searchParams.get("rfp") == rfp.id}>
                                                        <DialogTrigger className="w-full h-full" onClick={() => {
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
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            )}
                            {rfps.filter(rfp => rfp.pinned).length <= 0 && (
                                isPrivate
                                    ? <PrivateNoPinnedRFPs /> 
                                    : <PublicNoPinnedRFPs />
                            )}
                        </TabsContent>
                        <TabsContent value="tools">
                            {tools.filter(tool => tool.pinned).length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Contacts</TableHead>
                                        <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tools.filter(tool => tool.pinned).map((tool) => (
                                            <Dialog key={tool.id}>
                                                <DialogTrigger asChild onClick={() => {
                                                    mixpanelTrack("Tool Details Viewed", {
                                                        "ID": tool.id,
                                                        "Tool Name": tool.title,
                                                        "Linked Projects": tool.milestones.map(({ milestone }: any) => milestone),
                                                        // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                                                        // we flatten them into a single list that can be parsed
                                                        "Linked Project Types": tool.milestones.flatMap(({ milestone }: any) =>
                                                            (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                                                        )
                                                    })
                                                }}>
                                                    <TableRow key={tool.id} className="cursor-pointer">
                                                        <TableCell>
                                                            <div>
                                                                {tool.title} {tool.private && <PrivateBadge iconOnly={true} />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="line-clamp-3">
                                                                {tool.description}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <ul className="flex flex-col gap-2">
                                                                {tool.contacts.map((contact: any, index: number) => (
                                                                    <li key={index}>
                                                                        {contact.name || contact.email || contact.affiliation}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Pin fill="current-color" className="h-4 w-4"/>
                                                        </TableCell>
                                                    </TableRow>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <AssetDetails tool={tool} />
                                                </DialogContent>
                                            </Dialog>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {tools.filter(tool => tool.pinned).length <= 0 && (
                                isPrivate
                                    ? <PrivateNoPinnedAssets /> 
                                    : <PublicNoPinnedAssets />
                            )}
                        </TabsContent>
                    </Tabs>
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
