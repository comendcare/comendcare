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
import { mixpanelTrack } from "@comend/lib/mixpanel"
import { revalidate } from "@comend/lib/revalidate"
import { usePathname } from "next/navigation"

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
    const pathname = usePathname()
    const { deleteNode, setSelectedNodeIds } = useRoadmapStore(useShallow(selector))

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
        revalidate(pathname)
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
