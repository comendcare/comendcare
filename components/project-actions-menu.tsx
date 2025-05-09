import { Ellipsis } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { useEffect, useRef, useState } from "react"
import { Milestone } from "@/lib/types"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Dialog } from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    setMilestones: state.setMilestones,
    addMilestones: state.addMilestones
})

export const ProjectActionsMenu = ({milestone}: {milestone: Milestone}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)
    const popoverRef = useRef<HTMLInputElement>(null)

    const {setSelectedNodeId, addMilestones} = useRoadmapStore(useShallow(selector))

    const handleEdit = () => {
        setSelectedNodeId(milestone.nodeId)
    }

    const handleDuplicate = async () => {
        const milestones = await addMilestones([{
            nodeType: milestone.nodeType || milestone.nodeType,
            title: milestone.title,
            description: milestone.description,
            types: milestone.types || [],
            status: milestone.status
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
        <Popover open={isOpen}>
            <PopoverTrigger asChild>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                    variant="ghost"
                    className="p-2 h-auto justify-end h-full"
                >
                    <Ellipsis />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col w-fit p-2 z-20" side={'left'} sideOffset={4} ref={popoverRef}>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleEdit()
                        setIsOpen(false)
                    }}
                    variant="ghost"
                    className="h-full justify-start"
                >
                    Edit
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate()
                        setIsOpen(false)
                    }}
                    variant="ghost"
                    className="h-full justify-start"
                >
                    Duplicate
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleDelete()
                        setIsOpen(false)
                    }}
                    variant="ghost"
                    className="h-full justify-start"
                >
                    Delete
                </Button>
            </PopoverContent>
        </Popover>
        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DeleteMilestoneDialogContent milestoneData={milestone}/>
        </Dialog>
        </>
    )
}