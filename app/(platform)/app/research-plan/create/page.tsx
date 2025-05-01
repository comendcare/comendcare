import { EditResearchPlanForm } from "@/components/edit-research-plan-form"
import { Separator } from "@/components/ui/separator"

export default async function CreateResearchPlanPage() {
    return (
        <div className="h-full w-full flex flex-col justify-start items-start py-8 sm:px-6 lg:px-8 space-y-4 w-full">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Create a Research Plan</h1>
                <p>
                    {`To help create your research plan, pleae answer a few questions.`}
                </p>
            </div>
            <Separator/>
            <EditResearchPlanForm />
        </div>
    )
}