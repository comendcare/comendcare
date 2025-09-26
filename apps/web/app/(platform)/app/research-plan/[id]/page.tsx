import {getSession} from "@/packages/lib/auth"
import {Roadmap} from "~web/components/roadmap"
import NoOrganization from "~web/components/no-organization";
import TimelineViewSkeleton from "~web/app/(platform)/app/research-plan/[id]/loading";

export default async function RoadmapPage({params}: {params: { id: string }}) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <Roadmap />
}
