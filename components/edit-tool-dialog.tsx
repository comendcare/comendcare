"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditToolForm } from "@/components/edit-tool-form";
import { ReactNode, useState } from "react";
import { Tool } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const NewToolDialog = ({iconOnly = false, numToolsPinned}: {iconOnly?: boolean, numToolsPinned: number}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {iconOnly ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={"cta"} size={"icon"} onClick={() => setIsOpen(true)}>
                            <Plus />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Create a tool
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button variant={"cta"} onClick={() => setIsOpen(true)}>
                    <Plus />
                    {`Create a tool`}
                </Button>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create a Tool
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your Tool here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditToolForm toolData={{}} closeDialog={closeDialog} numToolsPinned={numToolsPinned}/>
            </DialogContent>
        </Dialog>
    )
}

export const EditToolDialog = ({children, data, numToolsPinned}: {children: ReactNode, data: Partial<Tool>, numToolsPinned: number}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="cursor-pointer">
                {children}
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit a Tool
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your Tool here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditToolForm toolData={data} closeDialog={closeDialog} numToolsPinned={numToolsPinned}/>
            </DialogContent>
        </Dialog>
    )
}
