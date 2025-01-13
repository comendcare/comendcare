import {getSession} from "@/lib/auth";
import { KanbanView } from "@/components/kanban";
import { getKanbanFromOrganizationId } from "@/lib/fetchers";
import NoOrganization from "@/components/no-organization";
import NewKanbanForm from "@/components/new-kanban";

export default async function KanbanPage({ params }: {
    params: { id: string }
}) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) {
        return (
            <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
                <NoOrganization />
            </main>
        )
    }

    const response = await getKanbanFromOrganizationId()
    if (response.success && response.data) {
        return (
            <main className="flex flex-col space-y-4 p-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Kanban
                </h1>
                <KanbanView />
            </main>
        )
    }

    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewKanbanForm />
        </main>
    )
}