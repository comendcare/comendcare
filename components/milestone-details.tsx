"use client"

import React from "react"
import {ScrollArea} from "./ui/scroll-area"
import StatusButton from "./milestone-status-button"
import {FaArrowUpRightFromSquare, FaDollarSign, FaPaperclip} from "react-icons/fa6"
import {Label} from "./ui/label"
import {TaskType, TypeBadge} from "./private-milestone-node"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import {MILESTONE_TYPE_OPTIONS, NODE_TYPE_OPTIONS} from "@/lib/types"
import {Badge} from "./ui/badge"
import {DateView} from "./miletone-date-view"
import {BudgetView} from "./milestone-budget-view"
import {AssetEditForm} from "./asset-edit-form"
import {AssetDetails} from "./asset-details"
import {Separator} from "./ui/separator"
import Link from "next/link"
import {RFPDetails} from "./rfp-details.tsx"
import {Button} from "./ui/button"

export function MilestoneDetails({milestone}: { milestone: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row gap-4">
                <span className="flex flex-col gap-4 grow">
                    <div className="flex flex-row gap-4 items-center justify-between">
                        <CardTitle
                            className="scroll-m-20 text-2xl font-bold tracking-tight">
                            {milestone.title}
                        </CardTitle>

                        {milestone.node.type && (
                            <TypeBadge className="w-fit"
                                       type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestone.node.type))?.value || "PROJECT"}/>
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

                {/* {(milestone?.asset || milestone?.RFP) && (
                    <>
                        <Separator/>
                        <div className="grid grid-cols-2 gap-4">
                            {milestone.asset && (
                                <div className="flex flex-col gap-4">
                                    <h2 className="font-semibold text-xl">{`Assets`}</h2>
                                    <AssetDetails asset={milestone.asset}/>
                                </div>
                            )}

                            {milestone.RFP && (
                                <div className="flex flex-col gap-4">
                                    <h2 className="font-semibold text-xl">{`Projects`}</h2>
                                    <RFPDetails rfp={milestone.RFP}/>
                                </div>
                            )}
                        </div>
                    </>
                )} */}

                <span className="w-full flex gap-2 flex-wrap text-wrap">
                    {milestone.status &&
                        <StatusButton
                            className="text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
                            disabled={true}
                            status={milestone.status}
                            onStatusChange={() => {
                            }}
                        />
                    }
                    {(milestone.types || []).sort((a: any, b: any) => a.length - b.length).map((milestoneType: any, index: number) => (
                        <Badge variant="secondary" className="text-sm h-7 rounded-md px-2 py-1 font-medium" key={index}>
                            {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === milestoneType))?.label || "No type"}
                        </Badge>
                    ))}
                </span>

                {/*{(milestone.types || []).map((type: string, index: number) => (*/}
                {/*    <Badge className="flex text-sm h-[30px] w-fit" key={index}>*/}
                {/*        {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === type))?.label || "No type"}*/}
                {/*    </Badge>*/}
                {/*))}*/}

                {milestone.attachments && milestone.attachments.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <Separator/>
                        <h2 className="font-semibold text-xl">{`Links`}</h2>
                        <ol className="flex flex-row gap-4 flex-wrap">
                            {milestone?.attachments?.map((attachment: any, index: number) => (
                                <Link href={attachment.link} key={index} target="_blank">
                                    <Button variant="secondary">
                                        {/* <FaPaperclip/> */}
                                        <FaArrowUpRightFromSquare/>
                                        {attachment.name || attachment.link}
                                    </Button>
                                </Link>
                            ))}
                        </ol>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
