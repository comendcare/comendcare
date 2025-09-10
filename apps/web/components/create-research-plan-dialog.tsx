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

export default function CreateResearchPlanDialog({
                                                     trigger,
                                                     researchPlanData,
                                                 }: {
    trigger?: React.ReactNode
    researchPlanData?: Partial<Roadmap>
}) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="cta">Create Research Plan</Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
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
                            <DialogTitle className="text-xl">Create a Research Plan</DialogTitle>
                            <DialogDescription>
                                To help create your research plan, please answer a few questions.
                            </DialogDescription>
                        </DialogHeader>
                        <Separator />


                        <EditResearchPlanForm
                            researchPlanData={researchPlanData}
                            closeDialog={() => setOpen(false)}
                            setIsSubmitting={setIsLoading}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
