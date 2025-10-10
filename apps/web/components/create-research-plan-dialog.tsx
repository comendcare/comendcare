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
    const [isLoading, setIsLoading] = useState(false)

    const setLoadingBoth = (val: boolean) => {
        setIsLoading(val)
        if (setIsLoadingExternal) setIsLoadingExternal(val)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="cta">Create research plan</Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                {isLoading ? (
                    <div className="h-full w-full p-10 gap-4">
                        <div className="h-full flex flex-col space-y-8 items-center justify-center">
                            <Spinner className="scale-150" />
                            <div className="w-1/6 min-w-40">
                                <Image priority src={logo} alt="Comend logo" />
                            </div>
                            <p>Creating your research plan</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Create a research plan</DialogTitle>
                            <DialogDescription>
                                To help create your research plan, please answer a few questions.
                            </DialogDescription>
                        </DialogHeader>
                        <Separator />


                        <EditResearchPlanForm
                            researchPlanData={researchPlanData}
                            closeDialog={() => setOpen(false)}
                            setIsSubmitting={setLoadingBoth}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
