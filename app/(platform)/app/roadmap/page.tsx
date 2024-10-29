"use client"
import { Button } from "@/components/ui/button"
import { createRoadmap } from "@/lib/actions"
import { useRouter } from "next/navigation"

export default async function RoadmapPage() {
    const router = useRouter()

    const handleClick = async () => {
        const roadmap = await createRoadmap()
        router.push(`/app/roadmap/${roadmap.id}`)
    }

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <h1 className="text-xl">{`You don't currently have any roadmaps`}</h1>
            <Button onClick={handleClick}>Create a roadmap</Button>
        </main>
    )
}
