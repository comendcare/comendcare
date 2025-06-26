import NoOrganization from "~web/components/no-organization";
import { getSession } from "@comend/lib/auth";
import PAGProfilePage from "~web/components/profile-page"

export default async function ProfilePage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PAGProfilePage />
}
