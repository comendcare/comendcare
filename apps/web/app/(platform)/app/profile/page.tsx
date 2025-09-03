import NoOrganization from "~web/components/no-organization";
import { getSession } from "@/packages/lib/auth";
import PAGProfilePage from "~web/components/profile-page"
import { SearchParams } from "@/packages/components/types"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function ProfilePage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PAGProfilePage />
}
