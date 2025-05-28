"use client"

import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog"
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore"

const rfpSelector = (state: RFPState) => ({
    createRFP: state.createRFP,
    updateRFP: state.updateRFP,
    deleteRFP: state.deleteRFP,
    saveState: state.saveState
})

export const DeleteRFPDialog = ({rfpId, closeDialog}: {rfpId: string | undefined, closeDialog?: () => void}) => {
    const {data: session} = useSession()
    const { deleteRFP, saveState } = useRFPStore(useShallow(rfpSelector))
    const { undo } = useRFPStore.temporal.getState()

    const handleUndo = () => {
        undo()
        saveState(session?.user?.organizationId)
        toast.dismiss("undo-toast")
    }

    const handleDeleteRFP = async () => {
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            )
            return
        }

        if (!rfpId) {
            toast.error(
                "This RFP does not have an id.",
                {position: "bottom-left"}
            )
            return
        }

        try {
            await deleteRFP(rfpId, session.user.organizationId)
            if (closeDialog) closeDialog()
            toast(
                <div className="flex flex-col gap-2 w-full">
                    <span className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">
                            {`RFP Deleted`}
                        </p>
                        <Button className="self-end" onClick={handleUndo}>Undo Delete</Button>
                    </span>
                </div>,
                {position: "bottom-left", duration: 20000, id: "undo-toast"}
            )
        } catch (error) {
            console.error("Error deleting RFP:", error);
            toast.error(
                "Failed to delete RFP.",
                {position: "bottom-left"}
            );
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                    {`This action cannot be undone. This will permanently delete your RFP and it's data.`}
                </DialogDescription>
                <DialogFooter>
                    <DialogClose>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose>
                        <Button
                            type="button"
                            variant={"destructive"}
                            onClick={handleDeleteRFP}
                        >
                            Delete RFP
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}