import NoOrganization from "@/components/no-organization";
import { getSession } from "@/lib/auth";
import PAGProfilePage from "@/components/profile-page"

export default async function ProfilePage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />

    return <PAGProfilePage />
}
