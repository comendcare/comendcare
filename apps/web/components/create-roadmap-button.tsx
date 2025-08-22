"use client"

import {useTransition} from "react"
import {createRoadmap} from "@comend/lib/actions"
import {cn} from "@comend/lib/utils"
import {useParams, useRouter} from "next/navigation"
import LoadingDots from "@comend/components/icons/loading-dots"
import va from "@vercel/analytics"
import {useSession} from "next-auth/react";

export default function CreateRoadmapButton() {
    const router = useRouter()
    const {data: session} = useSession()
    const {id} = useParams() as { id: string }
    const [isPending, startTransition] = useTransition()

    return (
        <button
            onClick={() =>
                startTransition(async () => {
                    const roadmap = await createRoadmap(
                        id,
                        undefined,
                        {userId: session?.user.id, userName: session?.user.name}
                    )
                    va.track("Created Roadmap")
                    router.refresh()
                    if (roadmap) router.push(`/admin/research-plan/${roadmap?.id}`)
                })
            }
            className={cn(
                "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
                isPending
                    ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
            )}
            disabled={isPending}
        >
            {isPending ? (
                <LoadingDots color="#808080"/>
            ) : (
                <p>Create New Roadmap</p>
            )}
        </button>
    )
}
