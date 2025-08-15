"use client"

import { Button } from "@comend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Plus } from "lucide-react";
import { ReactNode, useState } from "react";
import { Asset } from "@comend/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { EditBiosampleToolForm } from "./edit-biosample-tool-form";
import { EditDataToolForm } from "./edit-data-tool-form";
import { EditDiseaseModelToolForm } from "./edit-disease-model-tool-form";

export const NewToolDialog = ({numAssetsPinned, type}: {numAssetsPinned: number, type: 'biosample' | 'data' | 'diseaseModel'}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button variant={"cta"} onClick={() => setIsOpen(true)}>
                <Plus />
                {type === 'biosample' && 'Create Biosample'}
                {type === 'diseaseModel' && 'Create Disease Model'}
                {type === 'data' && 'Create Clinical Dataset'}
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === 'biosample' && 'Create Biosample'}
                        {type === 'diseaseModel' && 'Create Disease Model'}
                        {type === 'data' && 'Create Clinical Dataset'}
                    </DialogTitle>
                    <DialogDescription>
                        {`Create your Tool here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                {type === 'biosample' && (
                    <EditBiosampleToolForm toolData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
                {type === 'diseaseModel' && (
                    <EditDiseaseModelToolForm toolData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
                {type === 'data' && (
                    <EditDataToolForm toolData={{}} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
                )}
            </DialogContent>
        </Dialog>
    )
}

export const EditAssetDialog = ({children, data, numAssetsPinned, type}: {children?: ReactNode, data: Partial<Asset>, numAssetsPinned: number, type: 'biosample' | 'data' | 'diseaseModel'}) => {
    const [isOpen, setIsOpen] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
    }

    return (
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
            {type === 'diseaseModel' && (
                <EditDiseaseModelToolForm toolData={data} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
            )}
            {type === 'data' && (
                <EditDataToolForm toolData={data} closeDialog={closeDialog} numAssetsPinned={numAssetsPinned}/>
            )}
        </DialogContent>
    )
}
