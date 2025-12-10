"use client"
import React from "react"
import { Button } from "@comend/components/ui/button"
import { RoadmapState, useRoadmapStore } from "./../state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { mixpanelTrack } from "@comend/lib/mixpanel"

const selector = (state: RoadmapState) => ({
    deleteNode: state.deleteNode,
    saveState: state.saveState,
    setSelectedNodeIds: state.setSelectedNodeIds
})

export function DeleteMilestoneDialogContent({
    milestoneData,
}: {
    milestoneData: any
}) {
    const { deleteNode, saveState, setSelectedNodeIds } = useRoadmapStore(useShallow(selector))
    const { undo } = useRoadmapStore.temporal.getState()

    // const handleUndo = () => {
    //     // undo twice to open up milestone panel if it was open previously
    //     undo()
    //     undo()
    //     saveState()
    //     toast.dismiss("undo-toast")
    // }

    const handleDeleteMilestone = async (e: React.MouseEvent<HTMLElement>) => {
        console.log(`handle Milestone delete...`, milestoneData?.nodeId)
        try {
            mixpanelTrack("Project Deleted", {
                "ID": milestoneData?.id,
                "Title": milestoneData?.title,
                "Types": (milestoneData.types || []).map((type: any) => type.milestoneType?.label || type.milestoneType?.id),
                "Status": milestoneData.status,
                "Budget": milestoneData.budget
            })
        } catch (e) {
            console.error(`error tracking mixpanel event`)
        }

        await setSelectedNodeIds([])
        await deleteNode(milestoneData?.nodeId)

        toast(
            <div className="flex justify-between items-center w-full">
                <p className="font-semibold text-gray-900">
                    {`Project Deleted`}
                </p>
                {/* <Button className="self-end" onClick={handleUndo}>Undo Delete</Button> */}
            </div>,
            {position: "bottom-left", duration: 20000, id: "undo-toast"}
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                    {`This action cannot be undone. This will permanently delete your project and it's data.`}
                </DialogDescription>
                <DialogFooter>
                    <DialogClose>
                        <Button type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose>
                        <Button
                            type="button"
                            variant={"destructive"}
                            onClick={handleDeleteMilestone}
                        >
                            Delete project
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}
