"use client"
import { EditResearchPlanForm } from "@/components/edit-research-plan-form"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import Spinner from "@/components/ui/spinner"
import { useState } from "react"

export default function CreateResearchPlanPage() {
    const [isLoading, setIsLoading] = useState(false)

    if (isLoading) {
        return (
            <div className="h-full w-full p-10 gap-4">
                <Skeleton className="h-full w-full flex flex-col gap-8 items-center justify-center">
                    <div className="flex flex-col space-y-8 items-center justify-center">
                        <Spinner className="scale-150" />
                    </div>
                    <p>Creating your research plan...</p>
                </Skeleton>
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