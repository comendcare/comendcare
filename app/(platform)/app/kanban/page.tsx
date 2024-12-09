import {KanbanView} from "@/components/kanban";

export default async function KanbanPage() {
    return (
        <main className="flex flex-col space-y-4 p-8">
            <h1 className="text-3xl font-bold tracking-tight">
                Dashboard
            </h1>
            <KanbanView/>
        </main>
    )
}