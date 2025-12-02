"use client"

import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@comend/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from "@comend/components/ui/dialog"
import { usePathname } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import { deleteBiosamples } from "@comend/lib/actions"

export const DeleteBiosampleDialog = ({toolIds, closeDialog}: {toolIds: string[] | undefined, closeDialog?: () => void}) => {
    const {data: session} = useSession()
    const pathname = usePathname()

    const handleDeleteAsset = async () => {
        if (!session?.user?.organizationId) {
            toast.error(
                "You're not signed into an organization right now.",
                {position: "bottom-left"}
            )
            return
        }

        if (!toolIds) {
            toast.error(
                "This tool does not have an id.",
                {position: "bottom-left"}
            )
            return
        }

        try {
            await deleteBiosamples(session.user.organizationId, toolIds)
            await revalidate(pathname)
            if (closeDialog) closeDialog()
        } catch (error) {
            console.error("Error deleting tools:", error);
            toast.error(
                "Failed to delete tools",
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
                    {toolIds && toolIds.length > 1 
                        ? (`This action cannot be undone. This will permanently delete your tools and their data.`) 
                        : (`This action cannot be undone. This will permanently delete your tool and it's data.`)}
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
                            {toolIds && toolIds.length > 1 ? "Delete tools" : "Delete tool"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}
