"use client"

import React from "react"
import StatusButton from "./milestone-status-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card"
import {NODE_TYPE_OPTIONS} from "@/lib/types"
import {DateView} from "./miletone-date-view"
import {BudgetView} from "./milestone-budget-view"
import {Separator} from "./ui/separator"
import Link from "next/link"
import {Button} from "./ui/button"
import { TypeBadge } from "./type-badge"
import { MilestoneTypeBadge } from "./milestone-type-badge"
import { ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { RFPCard } from "./rfp-card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PrivateBadge } from "./private-badge"
import { AssetDetails, RFPDetails } from "./pag-profile-assets-and-projects-hoverable-card"

export function MilestoneDetails({milestone}: { milestone: any }) {
    return (
        <Card className="border-2 border-black">
            <CardHeader className="flex flex-row gap-4">
                <span className="flex flex-col gap-4 grow">
                    <div className="flex flex-row gap-4 items-center justify-between">
                        <CardTitle
                            className="scroll-m-20 text-2xl font-bold tracking-tight">
                            {milestone.title}
                        </CardTitle>

                        {milestone.nodeType && (
                            <TypeBadge className="w-fit"
                                       type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestone.nodeType))?.value || "PROJECT"}/>
                        )}
                    </div>

                    <CardDescription className="text-base">
                        {milestone.description}
                    </CardDescription>

                </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <DateView startDate={milestone.startDate} endDate={milestone.endDate}/>
                <BudgetView budget={milestone.budget}/>

                <span className="w-full flex gap-2 flex-wrap">
                    {milestone.status &&
                        <StatusButton
                            disabled={true}
                            status={milestone.status}
                            onStatusChange={() => {}}
                        />
                    }
                    {(milestone.types || []).sort((a: any, b: any) => a?.milestoneType?.length - b?.milestoneType?.length).map((milestoneType: any, index: number) => (
                        <MilestoneTypeBadge
                            key={index}
                            label={milestoneType?.milestoneType?.label}
                        />
                    ))}
                </span>

                {milestone.attachments && milestone.attachments.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <Separator/>
                        <h2 className="font-semibold text-xl">{`Links`}</h2>
                        <ol className="flex flex-row gap-4 flex-wrap">
                            {milestone?.attachments?.map((attachment: any, index: number) => (
                                <Link href={attachment.link} key={index} target="_blank">
                                    <Button variant="secondary">
                                        <ExternalLink />
                                        {attachment.name || attachment.link}
                                    </Button>
                                </Link>
                            ))}
                        </ol>
                    </div>
                )}

                {milestone.rfps && milestone.rfps.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <Separator/>
                        <h2 className="font-semibold text-xl">{`Requests for Proposals`}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {milestone.rfps?.map((rfp: any) => rfp.rfp)?.map((rfp: any, index: number) => (
                                <Dialog>
                                    <DialogTrigger>
                                        <RFPCard rfp={rfp} />
                                    </DialogTrigger>
                                    <DialogContent>
                                        <RFPDetails rfp={rfp} />
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>
                )}

                {milestone.assets && milestone.assets.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <Separator/>
                        <h2 className="font-semibold text-xl">{`Tools`}</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Contacts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {milestone.assets?.map((asset: any) => asset.asset)?.map((asset: any) => (
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
                                                <TableCell>
                                                    <ul className="flex flex-col gap-2">
                                                        {asset.contacts?.map((contact: any, index: number) => (
                                                            <li key={index}>
                                                                {contact.name || contact.email || contact.affiliation}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </TableCell>
                                            </TableRow>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <AssetDetails asset={asset} />
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
