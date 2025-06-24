"use client"
import { EditResearchPlanForm } from "~web/components/edit-research-plan-form"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { useState } from "react"
import Image from "next/image"
import logo from "@/public/Full logo.png"

export default function CreateResearchPlanPage() {
    const [isLoading, setIsLoading] = useState(false)

    if (isLoading) {
        return (
            <div className="h-full w-full p-10 gap-4">
                    <div className="h-full flex flex-col space-y-8 items-center justify-center">
                        <Spinner className="scale-150" />
                        <div className="w-1/6 min-w-40">
                            <Image priority src={logo} alt="Comend logo" />
                        </div>
                        <p>Creating your research plan</p>
                    </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col justify-start items-start py-8 sm:px-6 lg:px-8 space-y-4 w-full">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Create a Research Plan</h1>
                <p>
                    {`To help create your research plan, please answer a few questions.`}
                </p>
            </div>
            <Separator/>
            <EditResearchPlanForm setIsSubmitting={setIsLoading}/>
        </div>
    )
}
