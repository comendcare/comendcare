import React from "react"
import StatusButton from "./milestone-status-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import {BIOSAMPLE_TYPE_OPTIONS, NODE_TYPE_OPTIONS} from "@comend/lib/types"
import {DateView} from "./miletone-date-view"
import Link from "next/link"
import {Button} from "@comend/components/ui/button"
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge"
import {ExternalLink, Megaphone, Microscope, User, DollarSign, Lock, Calendar} from "lucide-react"
import {Dialog, DialogContent, DialogTrigger} from "@comend/components/ui/dialog"
import {RFPCard} from "./rfp-card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@comend/components/ui/table"
import {PrivateBadge} from "./private-badge"
import {AssetDetails, RFPDetails} from "./pag-profile-rfps-card"
import {TypeBadge} from "./type-badge"
import {Separator} from "@comend/components/ui/separator"
import {Badge, badgeVariants} from "@comend/components/ui/badge"
import {cn, formatMoney, truncate} from "@comend/lib/utils"

export function MilestoneDetails({milestone}: { milestone: any }) {
    const nodeType =
        NODE_TYPE_OPTIONS.find((option) => option.value === milestone.nodeType)?.value || "PROJECT"

    const hasAnyLinks =
        (milestone?.biosamples?.length ?? 0) > 0 ||
        (milestone?.diseaseModels?.length ?? 0) > 0 ||
        (milestone?.tools?.length ?? 0) > 0

    const hasAnyRFPs = (milestone?.rfps?.length ?? 0) > 0
    const hasAnyAttachments = (milestone?.attachments?.length ?? 0) > 0
    const hasAnyContacts = (milestone?.contacts?.length ?? 0) > 0
    const hasBudget = typeof milestone?.budget === "number"
 
    return (
        <Card className="w-full border-2 border-gray-300">
            <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <span className="break-words">{milestone.title || "Untitled Milestone"}</span>
                            {milestone?.private && (
                                <Lock size={18} className="text-gray-700" aria-label="Private"/>
                            )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {truncate(milestone?.description || "", 300)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                {/* Top badges row: types, contacts, dates, budget */}
                <ul className="w-full flex flex-row flex-wrap gap-2 text-sm">
                    {(milestone?.types || [])
                        .sort((a: any, b: any) =>
                            a?.milestoneType?.label && b?.milestoneType?.label
                                ? a.milestoneType.label.length - b.milestoneType.label.length
                                : 0
                        )
                        .map((milestoneType: any, index: number) => (
                            <li key={index}>
                                <Badge className="w-fit">
                                    {milestoneType?.milestoneType?.label || "No type"}
                                </Badge>
                            </li>
                        ))}
                </ul>


                <StatusButton
                    status={milestone?.status}
                    disabled
                    onStatusChange={() => {
                    }}
                />

                {(milestone?.startDate || milestone?.endDate) && (
                    <section className="flex flex-col gap-3">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        {milestone?.startDate && (
                            <div className="flex items-center justify-between">
                                <h2 className="text-md flex items-center gap-2">
                                    Start Date
                                </h2>
                                <p className="text-md flex gap-2 items-center">
                                    <Calendar />
                                    {milestone.startDate.toDateString()}
                                </p>
                            </div>
                        )}
                        {milestone?.endDate && (
                            <div className="flex items-center justify-between">
                                <h2 className="text-md flex items-center gap-2">
                                    End Date
                                </h2>
                                <p className="text-md flex gap-2 items-center">
                                    <Calendar />
                                    {milestone.endDate.toDateString()}
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {hasBudget && (
                    <section className="flex flex-col gap-3">
                        {/* <Separator className="bg-gray-300 h-[2px] rounded-full"/> */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-md flex items-center gap-2">
                                Budget
                            </h2>
                            <p className="text-md flex gap-2 items-center">
                                <DollarSign />
                                {milestone?.budget?.toLocaleString()}
                            </p>
                        </div>
                    </section>
                )}


                {hasAnyContacts && (
                    <section className="flex flex-col gap-3">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                Contacts
                            </h2>
                        </div>
                        <ol className="flex flex-col justify-start gap-2">
                            {milestone.contacts.map((contact: any, index: number) => (
                                <div key={index} className="bg-secondary w-full rounded-md p-4">
                                    <h4 className="font-semibold text-md flex gap-2 items-center text-wrap">
                                        <User className="h-4 w-4"/>
                                        {contact.name}
                                    </h4>
                                    {contact.email && (
                                        <Link href={`mailto:${contact.email}`} className="underline">
                                            <p className="text-sm pl-6 text-wrap">{contact.email}</p>
                                        </Link>
                                    )}
                                    {contact.affiliation && (
                                        <p className="text-sm pl-6 text-muted-foreground text-wrap">{contact.affiliation}</p>
                                    )}
                                </div>
                            ))}
                        </ol>
                    </section>
                )}

                {/* Attachments */}
                {hasAnyAttachments && (
                    <section className="flex flex-col gap-3">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                Links
                            </h2>
                            <AttachmentsTag attachments={milestone.attachments}/>
                        </div>
                        <ol className="flex flex-row gap-2 flex-wrap">
                            {milestone.attachments.map((attachment: any, index: number) => (
                                <a
                                    key={index}
                                    href={attachment.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="secondary" className="flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4"/>
                                        <div className="truncate max-w-[260px]">
                                            {attachment.name || attachment.link}
                                        </div>
                                    </Button>
                                </a>
                            ))}
                        </ol>
                    </section>
                )}

                {/* Linked Tools (biosamples / disease models / tools) */}
                {(Array.isArray(milestone?.tools) || Array.isArray(milestone?.biosamples) || Array.isArray(milestone?.diseaseModels)) 
                && ((milestone?.tools || []).length > 0 || (milestone?.biosamples || []).length > 0 || (milestone?.diseaseModels || []).length > 0)
                && (
                    <div className="flex flex-col justify-between space-y-2">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            Tools
                        </h2>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Contacts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        ...(milestone?.tools ?? []).map((x: any) => ({type: "Tool", item: x?.tool})),
                                        ...(milestone?.biosamples ?? []).map((x: any) => ({
                                            type: "Biosample",
                                            item: x?.biosample
                                        })),
                                        ...(milestone?.diseaseModels ?? []).map((x: any) => ({
                                            type: "Disease model",
                                            item: x?.diseaseModel
                                        })),
                                    ]
                                        .filter((row) => row.item)
                                        .map(({type, item}: any) => (
                                            <TableRow key={`${type}-${item.id || item.title}`}>
                                                <TableCell>
                                                    <Badge className="w-fit">{type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="truncate">{item.title || item.name || BIOSAMPLE_TYPE_OPTIONS.find(option => option.value === item.types[0])?.label || "Untitled"}</span>
                                                        {item.private && <PrivateBadge iconOnly/>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="line-clamp-3">{item.description}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <ul className="flex flex-col gap-1">
                                                        {(item.contacts || []).map((c: any, i: number) => (
                                                            <li key={i} className="truncate">
                                                                {c.name || c.email || c.affiliation}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Linked RFPs */}
                {hasAnyRFPs && (
                    <section className="space-y-3">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        <div className="border-l-4 border-orange-200 pl-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Megaphone className="h-4 w-4 min-w-4 text-orange-900"/>
                                <span className="text-orange-900">Linked RFPs</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                {milestone.rfps
                                    .map((x: any) => x.rfp)
                                    .filter(Boolean)
                                    .map((rfp: any) => (
                                        <Dialog key={rfp.id}>
                                            <DialogTrigger asChild>
                                                <div className="cursor-pointer">
                                                    <RFPCard rfp={rfp}/>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <RFPDetails rfp={rfp}/>
                                            </DialogContent>
                                        </Dialog>
                                    ))}
                            </div>
                        </div>
                    </section>
                )}
            </CardContent>
        </Card>
    )
}

/** Small counter pill like the node’s AttachmentsTag */
function AttachmentsTag({attachments}: { attachments: any[] }) {
    return (
        <div
            className={cn(
                badgeVariants({variant: "secondary"}),
                "text-sm inline-flex items-center gap-2 rounded-md px-2 py-1 font-medium"
            )}
        >
            <ExternalLink className="h-4 w-4"/>
            {attachments.length === 1 ? "1 Link" : `${attachments.length} Links`}
        </div>
    )
}
