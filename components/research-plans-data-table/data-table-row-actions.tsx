"use client"

import {DotsHorizontalIcon} from "@radix-ui/react-icons"
import {Row} from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Asset} from "@/lib/types";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
}

export function DataTableRowActions<TData extends Asset>({row}: DataTableRowActionsProps<TData>) {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <DotsHorizontalIcon className="h-4 w-4"/>
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                        <DialogTrigger onClick={() => setIsOpen(true)} className="w-full text-start">
                            Edit
                        </DialogTrigger>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit an Asset
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your Asset here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditAssetForm toolData={{...row.original}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
            </DialogContent> */}
        </Dialog>
    )
}
