import {getSession} from "@/lib/auth";
import {KanbanView} from "@/components/kanban";
import {getKanbanFromOrganizationId} from "@/lib/fetchers";
import NewKanbanForm from "@/components/new-kanban";
import {createKanban} from "@/lib/actions";
import NoOrganization from "@/components/no-organization";

export default async function KanbanPage({params}: {
    params: { id: string }
}) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) {
        return (
            <NoOrganization/>
        )
    }

    let response = await getKanbanFromOrganizationId()

    if (response.success && !response.data) {
        // kanban doesn't exist, automatically create it
        response = await createKanban(orgId)
    }

    if (response.success && response.data) {
        return (
            <main className="flex flex-col p-4">
                <KanbanView/>
            </main>
        )
    }

    // fallback, if creating the kanban automatically was unsuccessful allow the user to manually create a kanban
    return (
        <main className="flex gap-8 flex-col w-full h-screen justify-center items-center mx-auto">
            <NewKanbanForm/>
        </main>
    )
}
