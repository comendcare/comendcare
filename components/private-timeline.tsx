"use client"

import React, { useEffect, useRef } from "react"
import {getDates} from "@/lib/utils";
import {PrivateBadge} from "./private-badge"
import { cn } from "@/lib/utils"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { TypeBadge } from "./type-badge"
import { Milestone, StatusType } from "@/lib/types"
import StatusButton from "./milestone-status-button"
import { MilestoneTypeBadge } from "./milestone-type-badge"
import {
    DndContext,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
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
import {GripVertical, Megaphone, Star, User} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { PropertyBadge } from "./property-badge"
import { ProjectActionsMenu } from "./project-actions-menu";

const SHOW_ACCESSIBILITY_MESSAGES = process.env.NEXT_PUBLIC_NODE_ENV !== "production"

const selector = (state: RoadmapState) => ({
    selectedNodeIds: state.selectedNodeIds,
    setSelectedNodeIds: state.setSelectedNodeIds,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
})

export const PrivateTimelineView = ({sortBy}: {sortBy: string}) => {
    const {
        selectedNodeIds,
        milestones,
        setMilestones
    } = useRoadmapStore(useShallow(selector))

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function getDraggedData(id: string) {
        const name = milestones?.find(item => item.id === id)?.title
        const position = (milestones?.findIndex(item => item.id === id) || 0) + 1
        const length = milestones?.length || 0

        return {name, position, length}
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            const data = getDraggedData(active?.id.toString())
            const message = `Picked up milestone ${data.name} at position ${data.position} of ${data.length}`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragOver({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Milestone ${activeData.name} was moved over position ${overData.position} of ${activeData.length}.`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Milestone ${activeData.name} is no longer over a droppable position.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragEnd({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Milestone ${activeData.name} was dropped into position ${overData.position} of ${activeData.length}`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Milestone ${activeData} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragCancel({active}) {
            const activeData = getDraggedData(active?.id.toString())
            const message = `Dragging was cancelled. Milestone ${activeData.name} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
    }

    return (
        <ScrollArea className="w-full h-full px-10 pt-0">
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
                            milestones ? milestones
                                .sort((a, b) => {
                                    // pre sort by creation date
                                    return ((a.createdAt?.getTime() || (new Date().getTime())) - (b.createdAt?.getTime() || (new Date().getTime())))
                                })
                                .sort((a, b) => {
                                    switch (sortBy) {
                                        case "custom": 
                                            return a.timelineOrder - b.timelineOrder
                                        case "start":
                                            if (!!a.startDate && !!b.startDate) return a.startDate.getTime() - b.startDate.getTime()
                                    
                                            // Keep relative order of items without a startDate
                                            if (!a.startDate && !b.startDate) return 0
                                    
                                            // Move items without startDate to the end
                                            return !!a.startDate ? -1 : 1
                                        case "end":
                                            if (!!a.endDate && !!b.endDate) return a.endDate.getTime() - b.endDate.getTime()
                                    
                                            // Keep relative order of items without a startDate
                                            if (!a.endDate && !b.endDate) return 0
                                    
                                            // Move items without startDate to the end
                                            return !!a.endDate ? -1 : 1
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
                                key={milestone.id}
                                selectedNodeIds={selectedNodeIds} 
                                disabled={sortBy !== "custom"}
                            />
                        ))}
                    </SortableContext>
                </ol>
            </DndContext>
        </ScrollArea>
    )
}

const DraggableTimelineItem = ({
    milestone, 
    index, 
    selectedNodeIds, 
    disabled,
}: {
    milestone: Milestone, 
    index: number, 
    selectedNodeIds: string[], 
    disabled: boolean,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: milestone.id})
    const {setSelectedNodeIds} = useRoadmapStore(useShallow(selector))
    const elementRef = useRef<HTMLDivElement>(null);

    const style = {
        transition,
        transform: transform ? `translateY(${transform.y}px)` : undefined, // Restrict X-axis
        touchAction: "none",
        userSelect: "none" as any,
    }

    useEffect(() => {
        // if only one project is selected, we automatically scroll to that project so it's visible in the view
        if (selectedNodeIds.length === 1 && milestone.nodeId && selectedNodeIds[0] === milestone.nodeId) {
            const el = elementRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const isVisible =
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth);

            if (!isVisible) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [selectedNodeIds])

    return (
        <li 
            key={milestone.id}
            ref={setNodeRef}
            style={style}
            className={cn( 
                "text-left hover:cursor-pointer flex items-start -ml-[54px] gap-2",
                isDragging ? "z-20" : "",
                index === 0 ? "click-project-step" : ""
            )}
            onClick={(event) => {
                console.log(`selected`, milestone.nodeId, event)
                if (event.metaKey) {
                    // TODO: add multiselect option here...
                    // if CMD (on mac) or CTRL (on windows) is held, add id to multiselect
                    
                } else {
                    // regular click, set selected node id
                    if (milestone.nodeId) {
                        setSelectedNodeIds([milestone.nodeId])
                    } else {
                        setSelectedNodeIds([])
                    }
                }
            }}
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
                <TypeBadge iconOnly={true} type={milestone?.nodeType || milestone?.nodeType || "PROJECT"}/>
            </span>
            <div 
                ref={elementRef}
                className={cn(
                    "bg-card hover:bg-secondary w-full p-4 rounded-md", 
                    milestone.nodeId && selectedNodeIds.includes(milestone.nodeId) ? "border-primary border-2" : ""
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
                    <ProjectActionsMenu milestone={milestone}/>
                </div>
                <p className={"mb-2 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-2"}>
                    {milestone.description}
                </p>
                <TimelineCardContents milestoneData={milestone} nodeType={milestone?.nodeType || milestone?.nodeType || "PROJECT"}/>
            </div>
        </li>
    )
}

export const TimelineCardContents = ({milestoneData, nodeType}: { milestoneData: Milestone, nodeType: string }) => {
    return (
        <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
            <li>
                <StatusButton
                    disabled={true}
                    status={milestoneData?.status as StatusType || undefined}
                    onStatusChange={() => {}}
                />
            </li>
            {(milestoneData?.types || []).map((milestoneType, index) => (
                <li key={index}>
                    <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                </li>
            ))}
            {(milestoneData?.contacts || []).map((contact, index) => {
                if (contact.affiliation) {
                    return (
                        <li key={index}>
                            <PropertyBadge icon={User}>
                                <p>{contact.affiliation}</p>
                            </PropertyBadge>
                        </li>
                    )
                }
            })}
            {(milestoneData?.tools || []).map((tool, index) => (
                <li key={index}>
                    <PropertyBadge icon={Star}>
                        <p>{tool.tool?.title}</p>
                    </PropertyBadge>
                </li>
            ))}
            {(milestoneData?.rfps || []).map((rfp, index) => (
                <li key={index}>
                    <PropertyBadge icon={Megaphone}>
                        <p>{rfp.rfp?.title}</p>
                    </PropertyBadge>
                </li>
            ))}
        </ul>
    )
}
