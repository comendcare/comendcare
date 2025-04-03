"use client"
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {usePathname, useRouter} from "next/navigation";
import {cn, sleep} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import { AssetDetails } from "./asset-details";
import { RFPDetails } from "./rfp-details.tsx";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { useStoreApi } from "@xyflow/react";
import { getNodesEdgesAndMilestones, getRoadmap } from "@/lib/fetchers";
import { useSession } from "next-auth/react";
import { createRoadmap } from "@/lib/actions";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
                        <TabsContent value="rfps" className="mx-8">
                            {rfps.length > 0 && (
                                <Carousel className="w-full" opts={{loop: true}}>
                                    <CarouselContent>
                                        {rfps.map((rfp, index) => (
                                            <CarouselItem key={index} className="lg:basis-1/2">
                                                <RFPCard rfp={rfp} />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            )}
                            {rfps.length <= 0 && (
                                <p>{`No RFPs (Requests for Proposals) to show`}</p>
                            )}
                        </TabsContent>
                        <TabsContent value="assets">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    {/* <TableHead>Linked Projects</TableHead> */}
                                    <TableHead>Contacts</TableHead>
                                    <TableHead>Links</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell>
                                                <div>
                                                    {asset.title}
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
                                            <TableCell>
                                                <ul className="flex flex-col gap-2">
                                                    {asset.attachments.map((attachment: any, index: number) => (
                                                        <li key={index} className="line-clamp-2">
                                                            {attachment.name || attachment.link}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
