"use client"

import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReactNode, useState } from "react";
import { EditRFPForm } from "./edit-rfp-form";
import { RFP } from "@comend/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import {Skeleton} from "@/packages/components/ui/skeleton";
import dynamic from "next/dynamic";

const EditRFPFormLazy = dynamic(
    () => import("./edit-rfp-form").then(m => m.EditRFPForm),
    { ssr: false, loading: () => <div className="overflow-hidden max-h-[60vh] -mr-2 pr-3 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
                <Skeleton className="h-10 w-full"/>
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-14 w-full"/>
                <Skeleton className="h-14 w-full"/>
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-14 w-full"/>
                <Skeleton className="h-14 w-full"/>
            </div>

            <Skeleton className="h-10 w-[100px]"/>
        </div> }
);

// (optional) warm the chunk on hover/focus
const preloadEditRFPForm = () => { void import("./edit-rfp-form"); };

export const NewRFPDialog = ({iconOnly = false}: {iconOnly?: boolean}) => {
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
                        Create RFP
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button variant={"cta"} onClick={() => setIsOpen(true)}>
                    <Plus />
                    {`Create RFP`}
                </Button>
            )}
            <DialogContent className="gap-0">
                <DialogHeader className="pb-4">
                    <DialogTitle>
                        Create an RFP
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your RFP here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                {isOpen && <EditRFPFormLazy rfpData={{}} closeDialog={closeDialog} />}
            </DialogContent>
        </Dialog>
    )
}

export const EditRFPDialog = ({children, data}: {children: ReactNode, data: Partial<RFP>}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild className="cursor-pointer">
                <button className="cursor-pointer">{children}</button>
            </DialogTrigger>

            <DialogContent className="gap-0">
                <DialogHeader className="pb-4">
                    <DialogTitle>
                        Edit an RFP
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your RFP here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                {isOpen && <EditRFPFormLazy rfpData={data} closeDialog={closeDialog} />}
            </DialogContent>
        </Dialog>
    )
}
