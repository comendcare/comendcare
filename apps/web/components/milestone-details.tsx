import React from "react"
import StatusButton from "./milestone-status-button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import {NODE_TYPE_OPTIONS} from "@comend/lib/types"
import {DateView} from "./miletone-date-view"
import Link from "next/link"
import {Button} from "@comend/components/ui/button"
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge"
import {ExternalLink, Megaphone, Microscope, User, DollarSign, Lock} from "lucide-react"
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

    return (
        <Card className="w-full border-2 border-gray-300">
            <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <span className="truncate">{milestone.title || "Untitled Milestone"}</span>
                            {milestone?.private && (
                                <Lock size={18} className="text-gray-700" aria-label="Private"/>
                            )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {truncate(milestone?.description || "", 300)}
                        </CardDescription>
                    </div>

                    {milestone.nodeType && (
                        <TypeBadge className="w-fit shrink-0" type={nodeType}/>
                    )}
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

                    {(milestone?.contacts || []).map((contact: any, i: number) => {
                        const label = contact?.affiliation || contact?.name || contact?.email
                        if (!label) return null
                        return (
                            <li key={i}>
                                <Badge className="w-fit flex items-center gap-1">
                                    <User size={16}/>
                                    <span className="max-w-[180px] truncate">{label}</span>
                                </Badge>
                            </li>
                        )
                    })}

                    {(milestone?.startDate || milestone?.endDate) && (
                        <li>
                            <Badge className="w-fit">
                                <DateView startDate={milestone?.startDate} endDate={milestone?.endDate}/>
                            </Badge>
                        </li>
                    )}

                    {typeof milestone?.budget === "number" && (
                        <li>
                            <Badge className="w-fit flex items-center gap-1">
                                <DollarSign size={16}/>
                                <span>{formatMoney(milestone.budget)}</span>
                            </Badge>
                        </li>
                    )}
                </ul>

                <StatusButton
                    status={milestone?.status}
                    minimal
                    disabled
                    onStatusChange={() => {
                    }}
                />

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
                {hasAnyLinks && (
                    <section className="space-y-3">
                        <Separator className="bg-gray-300 h-[2px] rounded-full"/>
                        <div className="border-l-4 border-emerald-200 pl-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Microscope className="h-4 w-4 min-w-4 text-emerald-900"/>
                                <span className="text-emerald-900">Linked Tools</span>
                            </div>

                            {/* Keep your detailed table w/ dialogs for Tools */}
                            {Array.isArray(milestone?.tools) && milestone.tools.length > 0 && (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Contacts</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {milestone.tools
                                                .map((t: any) => t.tool)
                                                .filter(Boolean)
                                                .map((tool: any) => (
                                                    <Dialog key={tool.id}>
                                                        <DialogTrigger asChild>
                                                            <TableRow className="cursor-pointer">
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="truncate">{tool.title}</span>
                                                                        {tool.private && <PrivateBadge iconOnly/>}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div
                                                                        className="line-clamp-3">{tool.description}</div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <ul className="flex flex-col gap-1">
                                                                        {(tool.contacts || []).map((c: any, i: number) => (
                                                                            <li key={i} className="truncate">
                                                                                {c.name || c.email || c.affiliation}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </TableCell>
                                                            </TableRow>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <AssetDetails tool={tool}/>
                                                        </DialogContent>
                                                    </Dialog>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </section>
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
