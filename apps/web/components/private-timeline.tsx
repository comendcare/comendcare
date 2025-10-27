"use client"

import React, { useEffect, useRef, useState } from "react"
import {formatMoney, getDates, truncate} from "@comend/lib/utils";
import {PrivateBadge} from "./private-badge"
import { cn } from "@comend/lib/utils"
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@comend/components/ui/button"
import { ScrollArea } from "@comend/components/ui/scroll-area"
import { BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, Milestone, StatusType } from "@comend/lib/types"
import StatusButton from "./milestone-status-button"
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge"
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
import {GripVertical, Megaphone, Microscope, User, Lock, Calendar, DollarSign, Database, Rat, TestTubeDiagonal, Globe} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import { PropertyBadge } from "./property-badge"
import { ProjectActionsMenu } from "./project-actions-menu";
import { TypeBadge } from "./type-badge";
import { Badge } from "@/packages/components/ui/badge";
import { DateView } from "./miletone-date-view";
import { Separator } from "@/packages/components/ui/separator";
import { Card, CardDescription, CardHeader, CardTitle } from "@/packages/components/ui/card";
import { Organization } from "@prisma/client";

const SHOW_ACCESSIBILITY_MESSAGES = process.env.NEXT_PUBLIC_NODE_ENV !== "production"

const selector = (state: RoadmapState) => ({
    selectedNodeIds: state.selectedNodeIds,
    setSelectedNodeIds: state.setSelectedNodeIds,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    setMilestone: state.setMilestone
})

export const TimelineView = ({
    sortBy, 
    organization, 
    contextMenuRef
}: {
    sortBy: string, 
    organization?: Organization,
    contextMenuRef: React.RefObject<HTMLDivElement>
}) => {
    const {
        selectedNodeIds,
        milestones,
        setMilestones
    } = useRoadmapStore(useShallow(selector))

    // const sensors = useSensors(
    //     useSensor(MouseSensor),
    //     useSensor(TouchSensor),
    //     useSensor(KeyboardSensor, {
    //         coordinateGetter: sortableKeyboardCoordinates
    //     })
    // )

    // function getDraggedData(id: string) {
    //     const name = milestones?.find(item => item.id === id)?.title
    //     const position = (milestones?.findIndex(item => item.id === id) || 0) + 1
    //     const length = milestones?.length || 0

    //     return {name, position, length}
    // }

    // const announcements: Announcements = {
    //     onDragStart({active}) {
    //         const data = getDraggedData(active?.id.toString())
    //         const message = `Picked up milestone ${data.name} at position ${data.position} of ${data.length}`
    //         if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //         return message
    //     },
    //     onDragOver({active, over}) {
    //         const activeData = getDraggedData(active?.id.toString())

    //         if (over) {
    //             const overData = getDraggedData(over?.id.toString())
    //             const message = `Milestone ${activeData.name} was moved over position ${overData.position} of ${activeData.length}.`
    //             if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //             return message
    //         }

    //         const message = `Milestone ${activeData.name} is no longer over a droppable position.`
    //         if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //         return message
    //     },
    //     onDragEnd({active, over}) {
    //         const activeData = getDraggedData(active?.id.toString())

    //         if (over) {
    //             const overData = getDraggedData(over?.id.toString())
    //             const message = `Milestone ${activeData.name} was dropped into position ${overData.position} of ${activeData.length}`
    //             if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //             return message
    //         }

    //         const message = `Milestone ${activeData} was dropped.`
    //         if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //         return message
    //     },
    //     onDragCancel({active}) {
    //         const activeData = getDraggedData(active?.id.toString())
    //         const message = `Dragging was cancelled. Milestone ${activeData.name} was dropped.`
    //         if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
    //         return message
    //     },
    // }

    return (
        <ScrollArea className="w-full h-full px-10 pt-0">
            {/* <DndContext
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
            > */}
                <ol className="ml-2 relative border-s-4 border-blue-light dark:border-gray-700 flex flex-col gap-4">
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
                                        case "default":
                                            if (!!a.node?.positionX && !!b.node?.positionX) return a.node.positionX - b.node.positionX

                                            // Keep relative order of items without a node position
                                            if (!a.node?.positionX && !b.node?.positionX) return 0
                                    
                                            // Move items without nodePosition to the end
                                            return !!a.node?.positionX ? -1 : 1
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
                                contextMenuRef={contextMenuRef}
                                isPrivate={true}
                                isDraggable={true}
                                organization={organization}
                            />
                        ))}
                    </SortableContext>
                </ol>
            {/* </DndContext> */}
        </ScrollArea>
    )
}

export const DraggableTimelineItem = ({
    milestone, 
    index, 
    selectedNodeIds, 
    disabled,
    contextMenuRef,
    isPrivate = false,
    isDraggable = false,
    organization,
}: {
    milestone: Milestone, 
    index: number, 
    selectedNodeIds: string[], 
    disabled: boolean,
    contextMenuRef?: React.RefObject<HTMLDivElement>,
    isPrivate?: boolean,
    isDraggable?: boolean,
    organization?: Partial<Organization>,
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
    const elementRef = useRef<HTMLDivElement>(null)

    const style = {
        transition,
        transform: transform ? `translateY(${transform.y}px)` : undefined, // Restrict X-axis
        touchAction: "none",
        userSelect: "none" as any,
    }
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as any;

        // Check if click was inside context menu
        if (contextMenuRef?.current?.contains(target)) return
        if (contextMenuRef?.current?.contains(target) || target.closest('[data-skip-outside-click]') || (event instanceof MouseEvent && event.button === 2)) {
            return
        }
        // Skip right clicks
        if (event instanceof MouseEvent && event.button === 2) return
        // If the user has the meta (ctrl/cmd) key, ctrl key, or alt key held down skip
        if (event.metaKey || event.ctrlKey || event.altKey) return

        if (selectedNodeIds.length > 1 && milestone.nodeId && selectedNodeIds.includes(milestone.nodeId)) {
            setSelectedNodeIds([])
        }
    }

    useEffect(() => {
        // if only one project is selected, we automatically scroll to that project so it's visible in the view
        if (selectedNodeIds.length >= 1 && milestone.nodeId && selectedNodeIds[0] === milestone.nodeId) {
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
        
        if (selectedNodeIds.length > 1) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchend', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        };
    }, [selectedNodeIds])

    return (
        <li 
            key={milestone.id}
            ref={setNodeRef}
            style={style}
            className={cn( 
                "text-left hover:cursor-pointer flex items-start -ml-[10px] gap-2",
                isDragging ? "z-20" : "",
                index === 0 ? "click-project-step" : ""
            )}
            onClick={(event) => {
                if (event.metaKey) {
                    // if CMD (on mac) or CTRL (on windows) is held, add id to multiselect
                    if (milestone.nodeId && !selectedNodeIds.includes(milestone.nodeId)) {
                        setSelectedNodeIds([...selectedNodeIds, milestone.nodeId])
                    }
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
            <span className="flex items-center justify-center rounded-full mt-6">
                {/* <TypeBadge iconOnly={true} type={milestone?.nodeType || milestone?.nodeType || "PROJECT"}/> */}
                <div className="bg-blue-light h-4 w-4 rounded-full"/>
            </span>
            <div 
                ref={elementRef}
                className={cn(
                    "bg-card w-full rounded-md relative p-4", 
                    milestone.nodeId && selectedNodeIds.includes(milestone.nodeId) ? "border-primary border-2" : ""
                )}
            >
                <TimelineItemContent 
                    isPrivate={true} 
                    milestone={milestone} 
                    isDraggable={isDraggable} 
                    disabled={disabled} 
                    attributes={attributes} 
                    listeners={listeners} 
                    organization={organization}
                />
            </div>
        </li>
    )
}

export const TimelineItemContent = ({
    milestone,
    disabled = true,
    isDraggable = false,
    isPrivate = false,
    organization,
    attributes,
    listeners
}: {
    milestone: Milestone,
    disabled?: boolean,
    isDraggable?: boolean,
    isPrivate?: boolean,
    organization?: Partial<Organization>,
    attributes?: any,
    listeners?: any
}) => {

    const {setMilestone} = useRoadmapStore(useShallow(selector))

    return (
        <>
        <div className="flex flex-row items-start justify-start gap-4 mr-8">
            <span>
                {/* hide for now, until we bring back custom order in the list view */}
                {/* {isDraggable && (
                    disabled ? (
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    disabled={true}
                                    type="button"
                                    variant={"ghost"}
                                    {...attributes}
                                    {...listeners}
                                    className="p-2 h-fit text-secondary-foreground/50 cursor-grab"
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
                            className="p-2 h-fit text-secondary-foreground/50 cursor-grab"
                        >
                            <span className="sr-only">Move timeline</span>
                            <GripVertical/>
                        </Button>
                    )
                )} */}
                {isPrivate && (
                    milestone.private ? (
                        <Button
                            className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-red-100 hover:bg-red-300"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (milestone.nodeId) setMilestone(milestone.nodeId, {private: false})
                            }}
                        >
                            <Lock size={20} className="text-red-800"/>
                        </Button>
                    ) : (
                        <Button
                            className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-green-100 hover:bg-green-300"
                            onClick={(e) => {
                                e.stopPropagation()
                                if (milestone.nodeId) setMilestone(milestone.nodeId, {private: true})
                            }}
                        >
                            <Globe size={20} className="text-green-800"/>
                        </Button>
                    )
                )}
                <p className="inline mr-2 font-semibold text-lg group-hover:underline">{milestone.title}</p>
            </span>
            {/* {milestone.private && <PrivateBadge iconOnly/>} */}
            <time
                className="mt-[12px] ml-auto min-w-fit block font-semibold leading-none dark:text-gray-500">
                {getDates(milestone)}
            </time>
            {isPrivate && (
                <div className="absolute top-[12px] right-0 p-2">
                    <ProjectActionsMenu milestone={milestone as Milestone} organization={organization}/>
                </div>
            )}
        </div>
        {/* <p className={"mb-2 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-1"}>
            {milestone.description}
        </p> */}

        <span className="flex flex-wrap gap-2 items-center">
            {(milestone?.types || []).map((milestoneType, index) => (
                <Badge key={index} className="min-w-fit w-fit m-1 font-normal">
                    {milestoneType?.milestoneType?.label || "No type"}
                </Badge>
            ))}
            {(milestone.contacts || []).map((contact, index) => {
                if (contact.affiliation) {
                    return (
                        <Badge key={index} className="min-w-fit w-fit m-1 font-normal">
                            <User size={16}/>
                            <p>{contact.affiliation}</p>
                        </Badge>
                    )
                }
            })}

            {(milestone.budget) && (
                <li>
                    <Badge className="min-w-fit w-fit m-1 font-normal">
                        <DollarSign size={16}/>
                        <p>{formatMoney(milestone.budget)}</p>
                    </Badge>
                </li>
            )}

            {(milestone?.biosamples?.length > 0 || milestone?.diseaseModels?.length > 0 || milestone?.tools?.length > 0) && (
                <>
                    {(milestone.biosamples || []).map(({biosample}, index) => {
                        const type = BIOSAMPLE_TYPE_OPTIONS.find((option, index) => option.value === biosample.types[0])
                        return (
                            <Badge key={index} variant="green">
                                <TestTubeDiagonal className="h-4 w-4" />
                                {`${biosample.id}`}
                            </Badge>
                        )
                    })}
                    {(milestone.diseaseModels || []).map(({diseaseModel}, index) => {
                        const type = DISEASE_MODEL_TYPE_OPTIONS.find((option, index) => option.value === diseaseModel.types[0])
                        return (
                            <Badge key={index} variant="green">
                                <Rat className="h-4 w-4" />
                                {`${diseaseModel.id}`}
                            </Badge>
                        )
                    })}
                    {(milestone.tools || []).map(({tool}, index) => (
                        <Badge key={index} variant="green">
                            <Database className="h-4 w-4" />
                            {`${tool?.id}`}
                        </Badge>
                    ))}
                </>
            )}
            {milestone?.rfps?.length > 0 && (
                <>
                    {milestone.rfps.map(({rfp}, index) => (
                        <Badge variant="orange">
                            <Megaphone className="h-4 w-4" />
                            {`${rfp?.title}`}
                        </Badge>
                    ))}
                </>
            )}
        </span>

        <li className="mt-4">
            <StatusButton
                disabled={true}
                minimal={true}
                className="h-[16px]"
                status={milestone.status as StatusType || undefined}
                onStatusChange={() => {}}
            />
        </li>
        {/* <TimelineCardContents milestoneData={milestone} nodeType={milestone?.nodeType || milestone?.nodeType || "PROJECT"}/> */}
        </>
    )
}
