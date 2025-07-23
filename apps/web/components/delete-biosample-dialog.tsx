"use client"

import { useToolStore } from "@/state/tool/toolStore"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@comend/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from "@comend/components/ui/dialog"
import { usePathname } from "next/navigation"
import { revalidate } from "@/packages/lib/revalidate"
import { deleteBiosample } from "@/packages/lib/actions"

export const DeleteBiosampleDialog = ({toolId, closeDialog}: {toolId: string | undefined, closeDialog?: () => void}) => {
    const {data: session} = useSession()
    const pathname = usePathname()
    const { undo } = useToolStore.temporal.getState()

    const handleUndo = async () => {
        undo()
        await revalidate(pathname)
        toast.dismiss("undo-toast")
    }

    const handleDeleteAsset = async () => {
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            )
            return
        }

        if (!toolId) {
            toast.error(
                "This tool does not have an id.",
                {position: "bottom-left"}
            )
            return
        }

        try {
            await deleteBiosample(session.user.organizationId, toolId, )
            await revalidate(pathname)
            if (closeDialog) closeDialog()
            // toast(
            //     <div className="flex flex-col gap-2 w-full">
            //         <span className="flex justify-between items-center">
            //             <p className="font-semibold text-gray-900">
            //                 {`Tool Deleted`}
            //             </p>
            //             <Button className="self-end" onClick={handleUndo}>Undo Delete</Button>
            //         </span>
            //     </div>,
            //     {position: "bottom-left", duration: 20000, id: "undo-toast"}
            // )
        } catch (error) {
            console.error("Error deleting tool:", error);
            toast.error(
                "Failed to delete tool.",
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
                    {`This action cannot be undone. This will permanently delete your Tool and it's data.`}
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
                            onClick={handleDeleteAsset}
                        >
                            Delete Tool
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}
