import NewPostDialog from "@/components/new-post-dialog";
import {getSession} from "@/lib/auth";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import NoOrganizationPage from "@/components/no-organization-page";
import {Post} from "@/components/post";

export default async function FeedPage() {
    const session = await getSession()

    let organization = null
    // let dbMilestones = []
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId)
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) {
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <UnverifiedOrganizationPage/>
            );
        }
        return (
            <main className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
                <NewPostDialog/>
                <Post/>
            </main>
        )
    } else {
        return (
            <NoOrganizationPage/>
        );
    }
}