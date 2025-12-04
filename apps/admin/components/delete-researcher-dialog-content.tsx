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

export function DeleteResearcherDialogContent({
    researcher
}: {
    researcher: any
}) {
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
                                console.log(`Delete researcher...`, researcher)
                                await deleteResearcher(researcher)
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
