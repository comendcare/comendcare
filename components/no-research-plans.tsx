import { Plus } from "lucide-react"
import Image from "next/image"
import { Button, buttonVariants } from "./ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function PrivateNoResearchPlansRow() {
    return (
        <div className="h-full flex items-center justify-center gap-8">
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <div className="flex flex-col justify-center items-start space-y-4">
                <h1 className="font-cal text-4xl">
                    {`No research plans yet!`}
                </h1>
                <p className="text-lg text-stone-500">
                    {`Your organization does not have any research plans yet.`}
                </p>
            </div>
        </div>
    )
}

export function PrivateNoResearchPlansColumn() {
    return (
        <div className="flex flex-col items-center justify-center space-x-4 space-y-4 my-8 text-center">
            <h1 className="font-cal text-4xl">
                {`No research plans yet!`}
            </h1>
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="dark:hidden"
            />
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={200}
                height={200}
                className="hidden dark:block"
            />
            <p className="text-lg text-stone-500">
                {`Your organization does not have any research plans yet. Create one to get started.`}
            </p>
            <Link href="/app/research-plan" className={cn(buttonVariants({ variant: "cta" }))}>
                <Plus />
                Create a research plan
            </Link>
        </div>
    )
}

export function PublicNoResearchPlans({organizationName}: {organizationName: string | null | undefined}) {
    return (
        <div className="flex flex-col items-center justify-center space-x-4 space-y-4 my-8">
            <h1 className="font-cal text-4xl">No research plan yet</h1>
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={300}
                height={300}
                className="dark:hidden"
            />
            <Image
                alt="No research plans"
                src="https://illustrations.popsy.co/gray/studying.svg"
                width={300}
                height={300}
                className="hidden dark:block"
            />
            <p className="text-lg text-stone-500">
                {organizationName ? `${organizationName} doesn't have any research plans yet.`: `This organization doesn't have any research plans yet.`}
            </p>
        </div>
    )
}
