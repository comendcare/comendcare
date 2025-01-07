import {getSession} from "@/lib/auth";
import { KanbanView } from "@/components/kanban";

export default async function KanbanPage({ params }: {
    params: { id: string }
}) {
    const session = await getSession()

    return (
        <main className="flex flex-col space-y-4 p-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Kanban
            </h1>
            <KanbanView />
        </main>
    )
}