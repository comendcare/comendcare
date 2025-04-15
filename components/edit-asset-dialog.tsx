"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditAssetForm } from "@/components/edit-asset-form";
import { ReactNode, useState } from "react";
import { Asset } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const NewAssetDialog = ({iconOnly = false, numAssetsPinned}: {iconOnly?: boolean, numAssetsPinned: number}) => {
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
                        Create an asset
                    </TooltipContent>
                </Tooltip>
            ) : (
                <Button variant={"cta"} onClick={() => setIsOpen(true)}>
                    <Plus />
                    {`Create an asset`}
                </Button>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create an Asset
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your Asset here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditAssetForm assetData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
            </DialogContent>
        </Dialog>
    )
}

export const EditAssetDialog = ({children, data, numAssetsPinned}: {children: ReactNode, data: Partial<Asset>, numAssetsPinned: number}) => {
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
                        Edit an Asset
                    </DialogTitle>
                    <DialogDescription>
                        {`Edit your Asset here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditAssetForm assetData={data} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
            </DialogContent>
        </Dialog>
    )
}
