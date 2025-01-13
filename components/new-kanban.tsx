"use client"

import {Button} from "@/components/ui/button";
import {useSession} from "next-auth/react"
import {useRouter} from "next/navigation";
import { createKanban } from "@/lib/actions";

export default function NewKanbanForm() {
    const {data: session} = useSession()
    const router = useRouter()

    const handleCreateKanban = async () => {
        if (session?.user?.organizationId) {
            const kanban = await createKanban(session.user.organizationId)
            console.log(`kanban`, kanban)
            router.refresh()
        } else {
            console.error(`organization id is not defined in the session:`, session)
        }
    }

    return (
        <div className="flex flex-col gap-8 align-center">
            <h1 className="text-3xl font-bold tracking-tight">
                Your org does not have a kanban board
            </h1>
            <Button onClick={handleCreateKanban}>
                Create Kanban
            </Button>
        </div>
    )
}

