import {getSession} from "@/lib/auth"
import {Roadmap} from "@/components/roadmap"
import NoOrganization from "@/components/no-organization";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export default async function RoadmapPage({params}: {params: { id: string }}) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) {
        return <NoOrganization />
    }

    return (
        <Roadmap />
    )
}