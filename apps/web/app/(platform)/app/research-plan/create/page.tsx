"use client"
import dynamic from "next/dynamic"
import { Separator } from "@comend/components/ui/separator"
import Spinner from "@comend/components/ui/spinner"
import { useState } from "react"
import Image from "next/image"
import logo from "@/public/Full logo.png"

const EditResearchPlanForm = dynamic(() => import("~web/components/edit-research-plan-form").then(mod => ({ default: mod.EditResearchPlanForm })), {
    loading: () => <Spinner className="scale-150" />,
    ssr: false
})

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
        <div className="h-full w-full flex flex-col justify-start items-start py-8 sm:px-6 lg:px-8 space-y-4">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Create a research plan</h1>
                <p>
                    {`To help create your research plan, please answer a few questions.`}
                </p>
            </div>
            <Separator/>
            <EditResearchPlanForm setIsSubmitting={setIsLoading}/>
        </div>
    )
}
