"use client"

import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReactNode, useState } from "react";
import { Asset } from "@comend/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { EditBiosampleToolForm } from "./edit-biosample-tool-form";
import { EditDataToolForm } from "./edit-data-tool-form";

export const NewToolDialog = ({iconOnly = false, numAssetsPinned, type}: {iconOnly?: boolean, numAssetsPinned: number, type: 'biosample' | 'data'}) => {
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
                {type === 'biosample' && (
                    <EditBiosampleToolForm toolData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
                {type === 'data' && (
                    <EditDataToolForm toolData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
            </DialogContent>
        </Dialog>
    )
}

export const EditAssetDialog = ({children, data, numAssetsPinned, type}: {children?: ReactNode, data: Partial<Asset>, numAssetsPinned: number, type: 'biosample' | 'data'}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
        // <Dialog open={isOpen} onOpenChange={setIsOpen}>
        //     <DialogTrigger asChild className="cursor-pointer">
        //         {children}
        //     </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit a Tool
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your Tool here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                {type === 'biosample' && (
                    <EditBiosampleToolForm toolData={data} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
                {type === 'data' && (
                    <EditDataToolForm toolData={data} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
            </DialogContent>
        // </Dialog>
    )
}
