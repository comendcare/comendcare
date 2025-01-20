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
            <main className="flex flex-col p-4">
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