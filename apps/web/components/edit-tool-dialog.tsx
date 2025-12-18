"use client";

import {useState, ReactNode, useEffect} from "react";
import dynamic from "next/dynamic";
import {Plus} from "lucide-react";
import {Button} from "@comend/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogTrigger
} from "@comend/components/ui/dialog";
import type {Asset, editBiosampleForm} from "@comend/lib/types";
import {Skeleton} from "@comend/components/ui/skeleton";

/** Individual form chunks (named exports) */
const BiosampleForm = dynamic(
    () => import("./edit-biosample-tool-form").then(m => m.EditBiosampleToolForm),
    {
        ssr: false, loading: () => <div className="overflow-hidden max-h-[80vh] -mr-2 pr-3 space-y-8">
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

            <div className="space-y-4">
                <Skeleton className="h-14 w-full"/>
                <Skeleton className="h-14 w-full"/>
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
        </div>
    }
);
const DiseaseModelForm = dynamic(
    () => import("./edit-disease-model-tool-form").then(m => m.EditDiseaseModelToolForm),
    {
        ssr: false, loading: () => <div className="overflow-hidden max-h-[80vh] -mr-2 pr-3 space-y-8">
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

            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-14 w-full"/>
                <Skeleton className="h-14 w-full"/>
            </div>

            <Skeleton className="h-10 w-[100px]"/>
        </div>
    }
);
const DataForm = dynamic(
    () => import("./edit-clinical-dataset-form").then(m => m.EditClincalDatasetForm),
    {ssr: false, loading: () => <div className="overflow-hidden max-h-[80vh] -mr-2 pr-3 space-y-8">
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

            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]"/>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-14 w-full"/>
                <Skeleton className="h-14 w-full"/>
            </div>

            <Skeleton className="h-10 w-[100px]"/>
        </div>
    }
);

type ToolType = "biosample" | "data" | "diseaseModel";

function LazyToolForm({
                          type,
                          toolData,
                          isClosing,
                          setIsClosing,
                          closeDialog,
                      }: {
    type: ToolType;
    toolData: Partial<Asset> | {};
    isClosing: boolean;
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
    closeDialog: (formValues?: any) => void;
}) {
    if (type === "biosample") return <BiosampleForm toolData={toolData} closeDialog={closeDialog} isClosing={isClosing} setIsClosing={setIsClosing} />;
    if (type === "diseaseModel") return <DiseaseModelForm toolData={toolData} closeDialog={closeDialog} isClosing={isClosing} setIsClosing={setIsClosing}/>;
    return <DataForm toolData={toolData} closeDialog={closeDialog} isClosing={isClosing} setIsClosing={setIsClosing}/>;
}

export const NewToolDialog = ({
    trigger,
    type, 
}: { 
    trigger: React.ReactNode,
    type: ToolType, 
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const closeDialog = () => {
        setIsOpen(false)
        setIsClosing(false)
    }

    const title =
        type === "biosample" ? "Create biosample" :
            type === "diseaseModel" ? "Create disease model" :
                "Create clinical dataset";

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    setIsClosing(true)
                }
            }}
        >
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {trigger}
            </DialogTrigger>

            <DialogContent className="gap-0">
                <DialogHeader className="pb-4">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {`Create your Tool here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>

                {/* Only mount the heavy form when the dialog is actually open */}
                {isOpen && (
                    <LazyToolForm 
                        type={type} 
                        toolData={{}} 
                        closeDialog={closeDialog} 
                        isClosing={isClosing} 
                        setIsClosing={setIsClosing}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export const EditAssetDialog = ({
                                    children,
                                    data,
                                    type,
                                    isClosing,
                                    setIsClosing,
                                    closeDialog,
                                }: {
    children?: ReactNode;
    data: Partial<Asset>;
    type: ToolType;
    isClosing: boolean;
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>,
    closeDialog: (formValues?: any) => void;
}) => {
    // This component is meant to be rendered *inside* a <Dialog> already.
    // If you prefer this to control its own open state, wrap with <Dialog> + trigger like NewToolDialog.
    return (
        <DialogContent className="gap-0">
            <DialogHeader className="pb-4">
                <DialogTitle>Edit a Tool</DialogTitle>
                <DialogDescription>
                    {`Edit your Tool here. Click save when you're done.`}
                </DialogDescription>
            </DialogHeader>
            <LazyToolForm type={type} toolData={data} closeDialog={closeDialog} isClosing={isClosing} setIsClosing={setIsClosing}/>
        </DialogContent>
    );
};
