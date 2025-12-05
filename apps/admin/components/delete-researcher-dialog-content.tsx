"use client"
import React from "react"
import { Button } from "@comend/components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@comend/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { deleteResearcher } from "~admin/lib/actions"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import { revalidate } from "@comend/lib/revalidate"
import {useRouter} from "next/navigation"

export function DeleteResearcherDialogContent({
    researcher
}: {
    researcher: any
}) {
    const pathname = usePathname()
    const router = useRouter()
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                    {`This action cannot be undone. This will permanently delete this researcher's profile.`}
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
                            onClick={async () => {
                                const response = await deleteResearcher(researcher)
                                console.log(`researcher delete`, response)
                                if (!response.success || response.error) {
                                    toast.error(`Error deleting researcher: ${response.error}`)
                                }
                                revalidate(pathname)
                                router.refresh()
                            }}
                        >
                            Delete researcher
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}
