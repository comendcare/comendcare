"use client"
import {Ellipsis, Pencil, Share, Trash} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import {Button} from "@comend/components/ui/button"
import {useRef, useState} from "react"
import {Milestone, MILESTONE_TYPE_OPTIONS} from "@comend/lib/types"
import {RoadmapState, useRoadmapStore} from "./../state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {Dialog, DialogContent, DialogPortal} from "@comend/components/ui/dialog"
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import ShareDialog from "./../components/share-dialog";
import type {Organization} from "@prisma/client";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@comend/components/ui/tooltip"
import { EditMilestoneForm } from "./edit-milestone-form"

const selector = (state: RoadmapState) => ({
    selectedNodeIds: state.selectedNodeIds,
    setSelectedNodeIds: state.setSelectedNodeIds,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    addMilestones: state.addMilestones
})

export const ProjectActionsMenu = ({
    milestone, 
    organization
}: { 
    milestone: Milestone, 
    organization?: Partial<Organization> 
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [editIsOpen, setEditIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    const handleDelete = async () => {
        // override default delete behaviour with our custom dialog
        setDeleteIsOpen(true)
    }

    return (
        <>
            <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsOpen(true)
                        }}
                        variant="ghost"
                        className="p-2 justify-end h-full"
                    >
                        <Ellipsis/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" sideOffset={4} className="w-40 p-1">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditIsOpen(true)
                            setIsOpen(false)
                        }}
                    >
                        <Pencil/>
                        Edit
                    </DropdownMenuItem>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <DropdownMenuItem
                                    disabled={milestone.private}
                                    onClick={(e) => {
                                        if (milestone.private) return
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleShare()
                                        setIsOpen(false)
                                    }}
                                >
                                    <Share />
                                    Share
                                </DropdownMenuItem>
                            </div>
                        </TooltipTrigger>
                        {milestone.private && (
                            <TooltipContent side={"left"}>
                                <p>Publish project to share.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                            setIsOpen(false)
                        }}
                    >
                        <Trash/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent className="min-w-fit">
                    { organization && "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${process.env.NEXT_PUBLIC_VERCEL_ENV
                                ? `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                : `http://${organization.subdomain}.localhost:3000`
                            }/research-plan/${milestone.roadmapId}?project=${milestone.id}`}                            organization={organization}
                            postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            embeddedProjectData={{
                                embeddedProjectLink: `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plan/${milestone.roadmapId}/project/${milestone.id}`,
                                projectId: milestone.id,
                                projectTitle: milestone.title
                            }}
                            // trackShareEvent={(socialOption: string) => {
                            //     mixpanelTrack(`Project Shared`, {
                            //         "Platform": socialOption,
                            //         ...(organization ? {
                            //             "Organization ID": organization.id,
                            //             "Organization Name": organization.name,
                            //             "Project ID": milestone.id,
                            //             "Project Title": milestone.title
                            //         } : undefined)
                            //     })
                            // }}
                            trackShareEvent={{
                                title: `Project Shared`,
                                additonalProperties: {
                                    "Project ID": milestone.id,
                                    "Project Title": milestone.title
                                }
                            }}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">Loading organization...</div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                        <DeleteMilestoneDialogContent milestoneData={milestone}/>
                    </div>
                </DialogPortal>
            </Dialog>

            <Dialog open={editIsOpen} onOpenChange={setEditIsOpen}>
                <DialogPortal>
                    <div onClick={(e) => e.stopPropagation()}>
                    <DialogContent>
                        <EditMilestoneForm 
                            organization={undefined}
                            milestoneData={milestone}
                            orgIsPublished={true}
                            biosampleOptions={[]}
                            diseaseModelOptions={[]}
                            clinicalDatasetOptions={[]}
                            rfpOptions={[]}
                            milestoneTypeOptions={MILESTONE_TYPE_OPTIONS}
                            onClose={() => setEditIsOpen(false)}
                        />
                    </DialogContent>
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    )
}
