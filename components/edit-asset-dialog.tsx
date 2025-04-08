"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { EditAssetForm } from "@/components/edit-asset-form";
import { ReactNode, useState } from "react";
import { Asset } from "@/lib/types";

export const NewAssetDialog = ({iconOnly = false}: {iconOnly?: boolean}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"cta"}>
                    <Plus />
                    {!iconOnly && `Create an asset`}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create an Asset
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your Asset here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditAssetForm assetData={{}} closeDialog={closeDialog}/>
            </DialogContent>
        </Dialog>
    )
}

export const EditAssetDialog = ({children, data}: {children: ReactNode, data: Partial<Asset>}) => {
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
                <EditAssetForm assetData={data} closeDialog={closeDialog}/>
            </DialogContent>
        </Dialog>
    )
}
