"use client"


import { useState } from "react"
import Image from "next/image"
import logo from "@/public/Full logo.png"


import { Separator } from "@comend/components/ui/separator"
import { Button } from "@comend/components/ui/button"
import Spinner from "@comend/components/ui/spinner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog"
import {EditResearchPlanForm} from "~web/components/edit-research-plan-form";
import type {Roadmap} from "@prisma/client";

export default function CreateResearchPlanDialog({
                                                     trigger,
                                                     researchPlanData,
                                                     setIsLoading: setIsLoadingExternal,
                                                 }: {
    trigger?: React.ReactNode
    researchPlanData?: Partial<Roadmap>
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [open, setOpen] = useState(false)
    const [isClosing, setIsClosing] = useState(false)

    const closeDialog = () => {
        setOpen(false)
        setIsClosing(false)
    }

    return (
        <Dialog 
            open={open} 
            onOpenChange={(open) => {
                if (!open) {
                    setIsClosing(true)
                } else {
                    setOpen(true)
                }
            }}
        >
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="cta">Create research plan</Button>
                )}
            </DialogTrigger>

            <DialogContent>
                <>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create a research plan</DialogTitle>
                        <DialogDescription>
                            To help create your research plan, please answer a few questions.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />

                    <EditResearchPlanForm 
                        researchPlanData={researchPlanData} 
                        closeDialog={closeDialog}
                        isClosing={isClosing} 
                        setIsClosing={setIsClosing}
                    />
                </>
            </DialogContent>
        </Dialog>
    )
}
