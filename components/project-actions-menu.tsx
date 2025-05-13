import {Copy, Ellipsis, Pencil, Share, Trash} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import {Button} from "./ui/button"
import {useEffect, useRef, useState} from "react"
import {Milestone} from "@/lib/types"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {Dialog, DialogContent, DialogPortal} from "./ui/dialog"
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import ShareDialog from "@/components/share-dialog";
import {toast} from "sonner";
import {getAllMembershipsFromUserId, getInvitations, getOrganizationFromOrganizationId, getUser} from "@/lib/fetchers";
import {useSession} from "next-auth/react";
import {Organization} from "@prisma/client";

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    addMilestones: state.addMilestones
})

export const ProjectActionsMenu = ({milestone}: { milestone: Milestone }) => {
    const {data: session, status} = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [organization, setOrganization] = useState<Organization | {}>({})
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const popoverRef = useRef<HTMLInputElement>(null)

    const {setSelectedNodeId, addMilestones} = useRoadmapStore(useShallow(selector))

    useEffect(() => {

        async function fetchOrgData() {
            if (session?.user.organizationId) {
                try {
                    const response = await getOrganizationFromOrganizationId(session.user.organizationId)

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                        setOrganization(response.data);
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error("Error fetching organizations:", error);
                    toast.error("Couldn't get organizations");
                }
            }
        }

        fetchOrgData()
    }, [session])

    const handleEdit = () => {
        setSelectedNodeId(milestone.nodeId)
    }

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    const handleDuplicate = async () => {
        const milestones = await addMilestones([{
            // nodeType: milestone.nodeType || milestone.nodeType,
            // title: milestone.title,
            // description: milestone.description,
            // types: milestone.types || [],
            // status: milestone.status,
            // assets: milestone.assets,
            // rfps: milestone.rfps,
            // contacts: milestone.contacts,
            ...milestone
        }], "Duplicate")
        if (milestones && milestones.length > 0) setSelectedNodeId(milestones[0].id)
    }

    const handleDelete = async () => {
        // override default delete behaviour with our custom dialog
        setDeleteIsOpen(true)
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (
            popoverRef.current &&
            !popoverRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
            popoverRef.current.blur();
        }
    };

    useEffect(() => {
        if (isOpen) {
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
    }, [isOpen]);

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-2 justify-end h-full">
                        <Ellipsis/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left" sideOffset={4} className="w-40 p-1">
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            handleEdit()
                        }}
                    >
                        <Pencil/>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            handleShare()
                        }}
                    >
                        <Share/>
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            handleDuplicate()
                        }}
                    >
                        <Copy/>
                        Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                    >
                        <Trash/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent>
                    { "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            organization={organization}
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
        </>
    )
}
