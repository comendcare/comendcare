"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReactNode, useState } from "react";
import { EditRFPForm } from "./edit-rfp-form";
import { RFP } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const NewRFPDialog = ({iconOnly = false, numRFPsPinned}: {iconOnly?: boolean, numRFPsPinned: number}) => {
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
                        Create an RFP
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button variant={"cta"} onClick={() => setIsOpen(true)}>
                    <Plus />
                    {`Create an RFP`}
                </Button>
            )}
            <DialogContent className="overflow-hidden">
                <DialogHeader className="pt-[80px]">
                    <DialogTitle>
                        Create an RFP
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your RFP here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditRFPForm rfpData={{}} closeDialog={closeDialog} numRFPsPinned={numRFPsPinned}/>
            </DialogContent>
        </Dialog>
    )
}

export const EditRFPDialog = ({children, data, numRFPsPinned}: {children: ReactNode, data: Partial<RFP>, numRFPsPinned: number}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="cursor-pointer">
                {children}
            </DialogTrigger>

            <DialogContent className="overflow-hidden">
                <DialogHeader className="pt-[80px]">
                    <DialogTitle>
                        Edit an RFP
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your RFP here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditRFPForm rfpData={data} closeDialog={closeDialog} numRFPsPinned={numRFPsPinned}/>
            </DialogContent>
        </Dialog>
    )
}
