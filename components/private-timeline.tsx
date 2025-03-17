"use client"

import React from "react"
import {getDates} from "./pag-profile-research-plan-card"
import {PrivateBadge} from "./private-badge"
import {FaArrowUpRightFromSquare, FaDollarSign, FaUser} from "react-icons/fa6"
import { cn, formatMoney } from "@/lib/utils"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ScrollArea } from "./ui/scroll-area"
import { TypeBadge } from "./type-badge"
import { Milestone } from "@/lib/actions"
import { Badge } from "./ui/badge"
import { AttachmentsTag } from "./private-milestone-node"
import { StatusType } from "@/lib/types"
import { DateView } from "./miletone-date-view"
import StatusButton from "./milestone-status-button"
import { MilestoneTypeBadge } from "./milestone-type-badge"
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    UniqueIdentifier,
    TouchSensor,
    MouseSensor,
    closestCorners
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {GripVertical} from "lucide-react"
import { cva } from "class-variance-authority"
import {CSS} from "@dnd-kit/utilities"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

const SHOW_ACCESSIBILITY_MESSAGES = process.env.NODE_ENV === "development"

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
})

export const PrivateTimelineView = ({sortBy}: {sortBy: string}) => {
    const {
        selectedNodeId,
        setSelectedNodeId,
        milestones,
        setMilestones,
        nodes,
        setNodes: setDbNodes,
        edges,
        onEdgesChange,
        addNodes,
        onConnect,
    } = useRoadmapStore(useShallow(selector))
const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleEditClick = (nodeId: string) => {
        setSelectedNodeId(nodeId)

        // const params = new URLSearchParams(searchParams.toString())
        // params.delete("milestone")
        // params.set("milestone", nodeId)

        // router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function getDraggedData(id: string) {
        const name = milestones?.find(item => item.id === id)?.name
        const position = (milestones?.findIndex(item => item.id === id) || 0) + 1
        const length = milestones?.length || 0

        return {name, position, length}
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            const data = getDraggedData(active?.id.toString())
            const message = `Picked up checklist item ${data.name} at position ${data.position} of ${data.length}`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragOver({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Checklist item ${activeData.name} was moved over position ${overData.position} of ${activeData.length}.`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Checklist item ${activeData.name} is no longer over a droppable position.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragEnd({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Checklist item ${activeData.name} was dropped into position ${overData.position} of ${activeData.length}`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Checklist item ${activeData} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragCancel({active}) {
            const activeData = getDraggedData(active?.id.toString())
            const message = `Dragging was cancelled. Checklist item ${activeData.name} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
    }

    return (
        <ScrollArea className="w-full h-full p-10 pt-0">
            <DndContext
                accessibility={{
                    announcements
                }}
                collisionDetection={closestCorners}
                sensors={sensors}
                onDragEnd={(event) => {
                    const {active, over} = event

                    if (active.id === over?.id) return

                    const originalPosition = milestones?.findIndex(item => item.id === active.id) || 0
                    const newPosition = milestones?.findIndex(item => item.id === over?.id) || 0

                    const updatedMilestones = arrayMove(milestones || [], originalPosition, newPosition)
                    setMilestones(updatedMilestones.map((milestone, index) => ({
                        ...milestone,
                        timelineOrder: index
                    })))
                }}
            >
                <ol className="ml-12 relative border-s-4 border-blue-light dark:border-gray-700 flex flex-col gap-4">
                    <SortableContext 
                        disabled={sortBy !== "custom"}
                        items={
                            milestones ? milestones.sort((a, b) => {
                                switch (sortBy) {
                                    case "custom": 
                                        return (a.timelineOrder - b.timelineOrder)
                                    case "start":
                                        return (a.startDate - b.startDate)
                                    case "end":
                                        return (a.endDate - b.endDate)
                                    default:
                                        return 0
                                }
                            }).map(milestone => milestone.id) : []
                        }
                        strategy={verticalListSortingStrategy}
                    >
                        {(milestones || []).map((milestone, index) => (
                            <DraggableTimelineItem 
                                milestone={milestone} 
                                index={index} 
                                selectedNodeId={selectedNodeId} 
                                handleEditClick={handleEditClick} 
                                disabled={sortBy !== "custom"}
                            />
                        ))}
                    </SortableContext>
                </ol>
            </DndContext>
        </ScrollArea>
    )
}

const DraggableTimelineItem = ({milestone, index, selectedNodeId, handleEditClick, disabled}: {milestone: any, index: number, selectedNodeId: string | null, handleEditClick: (nodeId: string) => void, disabled: boolean}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: milestone.id})

    const style = {
        transition,
        // transform: CSS.Translate.toString(transform),
        transform: transform ? `translateY(${transform.y}px)` : undefined, // Restrict X-axis
        touchAction: "none",
        userSelect: "none" as any,
    }

    return (
        <li 
            key={milestone.id}
            ref={setNodeRef}
            style={style}
            className={cn( 
                "text-left hover:cursor-pointer flex items-start -ml-[54px] gap-2",
                isDragging ? "z-20" : ""
            )}
            onClick={() => {handleEditClick(milestone.nodeId)}}
        >
            {disabled ? (
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            disabled={true}
                            type="button"
                            variant={"ghost"}
                            {...attributes}
                            {...listeners}
                            className="p-1 text-secondary-foreground/50 cursor-grab ml-1 mt-2"
                        >
                            <span className="sr-only">Move timeline</span>
                            <GripVertical/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>
                            {`Dragging is only available in custom mode.`}
                        </p>
                    </TooltipContent>
                </Tooltip>
            ): (
                <Button
                    type="button"
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className="p-1 text-secondary-foreground/50 cursor-grab ml-1 mt-2"
                >
                    <span className="sr-only">Move timeline</span>
                    <GripVertical/>
                </Button>
            )}
            <span className="flex items-center justify-center rounded-full mt-3">
                <TypeBadge className="w-8 p-2" iconOnly={true} type={milestone?.nodeType || milestone?.node?.type || "PROJECT"}/>
            </span>
            <div 
                className={cn(
                    "bg-card hover:bg-secondary w-full p-4 rounded-md", 
                    selectedNodeId === milestone.nodeId ? "border-primary border-2" : ""
                )}
            >
                <div className="flex flex-row items-center justify-start gap-4">
                    <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white ">
                        {milestone.title}
                    </h3>
                    {milestone.private && <PrivateBadge iconOnly/>}
                    <time
                        className="ml-auto block font-semibold leading-none dark:text-gray-500">
                        {getDates(milestone)}
                    </time>
                </div>
                <p className={"mb-2 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-2"}>
                    {milestone.description}
                </p>
                <TimelineCardContents milestoneData={milestone} nodeType={milestone?.nodeType || milestone?.node?.type || "PROJECT"}/>
            </div>
        </li>
    )
}

export const TimelineCardContents = ({milestoneData, nodeType}: { milestoneData: Milestone, nodeType: string }) => {
    if (nodeType === "ASSET") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                {(milestoneData?.types || []).sort((a, b) => a.milestoneType?.label.length - b.milestoneType?.label.length).map((milestoneType, index) => (
                    <li key={index}>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {milestoneData?.attachments && milestoneData?.attachments?.length > 0 && (
                    <li>
                        <AttachmentsTag attachments={milestoneData.attachments}/>
                    </li>
                )}
                {milestoneData?.contacts && milestoneData.contacts.length > 0 && (milestoneData?.contacts || []).map((contact, index) => {
                    if (contact.name && contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.name} &bull; {contact.email}</p>
                            </li>)
                    } else if (contact.name) {
                        return (
                            <li key={index} className="flex gap-2 items-center w-full">
                                <FaUser/>
                                <p>{contact.name}</p>
                            </li>)
                    } else if (contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.email}</p>
                            </li>)
                    }
                })}
            </ul>
        )

        return
    }

    if (nodeType === "PROJECT") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                <li>
                    <StatusButton
                        className="text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
                        disabled={true}
                        status={milestoneData?.status as StatusType || undefined}
                        onStatusChange={() => {
                        }}
                    />
                </li>
                {(milestoneData?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
                    <li key={index}>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {(milestoneData?.contacts || []).map((contact, index) => {
                    if (contact.affiliation) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.affiliation}</p>
                            </li>
                        )
                    }
                })}
            </ul>
        )
    }

    if (nodeType === "RFP") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                {(milestoneData?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
                    <li>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {milestoneData?.budget && (
                    <li className="flex gap-2 items-center">
                        <FaDollarSign/>
                        {formatMoney(milestoneData?.budget)} budget
                    </li>
                )}
            </ul>
        )
    }

    return (
        <div>error</div>
    )
}