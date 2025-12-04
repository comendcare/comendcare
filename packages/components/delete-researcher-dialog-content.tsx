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

export function DeleteResearcherDialogContent({
    researcher
}: {
    researcher: any
}) {
    // const handleDeleteMilestone = async (e: React.MouseEvent<HTMLElement>) => {
    //     console.log(`handle Milestone delete...`, milestoneData?.nodeId)

    //     await setSelectedNodeIds([])
    //     await deleteNode(milestoneData?.nodeId)

    //     toast(
    //         <div className="flex justify-between items-center w-full">
    //             <p className="font-semibold text-gray-900">
    //                 {`Project Deleted`}
    //             </p>
    //             <Button className="self-end" onClick={handleUndo}>Undo Delete</Button>
    //         </div>,
    //         {position: "bottom-left", duration: 20000, id: "undo-toast"}
    //     )
    // }

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
                            onClick={() => {
                                console.log(`Delete researcher...`)
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
