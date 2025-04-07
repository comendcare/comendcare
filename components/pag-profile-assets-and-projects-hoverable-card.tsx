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
import { Building, FileText, GraduationCap, Link as LinkIcon, User } from "lucide-react";
import { DateView } from "./miletone-date-view";
import { PrivateBadge } from "./private-badge";
import Link from "next/link";
import { ScrollArea } from "./ui/scroll-area";

export const PAGProfileAssetsAndRFPsHoverableCard = ({ assets, rfps, isPrivate }: { assets: any[], rfps: any[], isPrivate: boolean }) => {
    if (assets && rfps) {
        return (
            <Card className="organization-profile-tour-step5">
                <CardContent className="mt-8">
                    <Tabs defaultValue="rfps" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="rfps">Requests for Proposals</TabsTrigger>
                            <TabsTrigger value="assets">Assets</TabsTrigger>
                        </TabsList>
                        <TabsContent value="rfps">
                            {rfps.length > 0 && (
                                <div className="w-full px-8">
                                    <Carousel className="w-full" opts={{loop: true, align: "start"}}>
                                        <CarouselContent>
                                            {rfps.map((rfp, index) => (
                                                <CarouselItem key={index} className="lg:basis-1/2">
                                                    <Dialog>
                                                        <DialogTrigger className="w-full h-full">
                                                            <RFPCard rfp={rfp} />
                                                        </DialogTrigger>
                                                        <DialogContent>
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
                            {rfps.length <= 0 && (
                                <p>{`No RFPs (Requests for Proposals) to show`}</p>
                            )}
                        </TabsContent>
                        <TabsContent value="assets">
                            {assets.length > 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        {/* <TableHead>Linked Projects</TableHead> */}
                                        <TableHead>Contacts</TableHead>
                                        {/* <TableHead>Links</TableHead> */}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assets.map((asset) => (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <TableRow key={asset.id} className="cursor-pointer">
                                                        <TableCell>
                                                            <div>
                                                                {asset.title} {asset.private && <PrivateBadge iconOnly={true} />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="line-clamp-3">
                                                                {asset.description}
                                                            </div>
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            <ul className="flex flex-col gap-2">
                                                                {asset.milestones.map((milestone: any, index: number) => (
                                                                    <li key={index} className="line-clamp-2">
                                                                        {milestone.milestone?.title || undefined}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </TableCell> */}
                                                        <TableCell>
                                                            <ul className="flex flex-col gap-2">
                                                                {asset.contacts.map((contact: any, index: number) => (
                                                                    <li key={index}>
                                                                        {contact.name || contact.email || contact.affiliation}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            <ul className="flex flex-col gap-2">
                                                                {asset.attachments.map((attachment: any, index: number) => (
                                                                    <li key={index} className="line-clamp-2">
                                                                        {attachment.name || attachment.link}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </TableCell> */}
                                                    </TableRow>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <AssetDetails asset={asset} />
                                                </DialogContent>
                                            </Dialog>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {assets.length <= 0 && (
                                <p>{`No assets to show`}</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        );
    }
}

export const AssetDetails = ({asset}: {asset: any}) => {
    return (
        <ScrollArea className={"max-h-[600px] -mr-2 pr-3"}>
            <DialogHeader>
                <DialogTitle>{asset.title}</DialogTitle>
                <DialogDescription>{asset.description}</DialogDescription>
            </DialogHeader>

            <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                {(asset.milestones || []).map((milestone: any, index: number) => {
                    return (
                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                            <FileText className="h-4 w-4"/>
                            <p className="text-wrap break-words">{milestone.milestone.title}</p>
                        </li>
                    )
                })}

                {(asset.contacts || []).map((contact: any, index: number) => {
                    return (
                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                            <User className="h-4 w-4"/>
                            <p className="text-wrap break-words">
                                {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                            </p>
                        </li>
                    )
                })}

                {(asset.attachments || []).map((attachment: any, index: number) => {
                    return (
                        <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                            <LinkIcon className="h-4 w-4"/>
                            <Link 
                                target="_blank" 
                                className="text-wrap break-words underline" 
                                href={attachment.link || "#"}
                            >
                                {attachment.name || attachment.link}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </ScrollArea>
    )
}

export const RFPDetails = ({rfp}: {rfp: any}) => {
    return (
        <ScrollArea className={"max-h-[600px] -mr-2 pr-3"}>
        <DialogHeader>
            <DialogTitle>{rfp.title}</DialogTitle>
            <DialogDescription>{rfp.description}</DialogDescription>
        </DialogHeader>

        <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
            {(rfp.milestones || []).map((milestone: any, index: number) => {
                return (
                    <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                        <FileText className="h-4 w-4"/>
                        <p className="text-wrap break-words">{milestone.milestone.title}</p>
                    </li>
                )
            })}

            {(rfp.startDate || rfp.endDate) && (
                <li className="border-l-2 border-gray-300 pl-2">
                    <DateView 
                        specific={true} 
                        startDate={rfp.startDate || undefined} 
                        endDate={rfp.endDate || undefined} 
                        startLabel="Request Opens:" 
                        endLabel="Deadline for Proposals:"
                    />
                </li>
            )}

            {(rfp.contacts || []).map((contact: any, index: number) => {
                return (
                    <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                        <User className="h-4 w-4"/>
                        <p className="text-wrap break-words">
                            {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                        </p>
                    </li>
                )
            })}

            {(rfp.attachments || []).map((attachment: any, index: number) => {
                return (
                    <li key={index} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                        <LinkIcon className="h-4 w-4"/>
                        <Link 
                            target="_blank" 
                            className="text-wrap break-words underline" 
                            href={attachment.link || "#"}
                        >
                            {attachment.name || attachment.link}
                        </Link>
                    </li>
                )
            })}
            
            {rfp.openTo && rfp.openTo.includes('ACADEMIC') && (
                <li className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                    <GraduationCap className="h-4 w-4"/>
                    <p>Open to Academics</p>
                </li>
            )}

            {rfp.openTo && rfp.openTo.includes('CRO') && (
                <li className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                    <Building className="h-4 w-4"/>
                    <p>Open to CROs</p>
                </li>
            )}
        </ul>
        </ScrollArea>
    )
}
