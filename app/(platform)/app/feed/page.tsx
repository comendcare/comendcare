import NewPostDialog from "@/components/new-post-dialog";
import {getSession} from "@/lib/auth";
import {getOrganizationFromOrganizationId, getPosts} from "@/lib/fetchers";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import NoOrganization from "@/components/no-organization";
import Image from "next/image";
import {PostList} from "@/components/post-list";

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

    const posts = await getPosts()
    console.log(posts)

    if (organization) {
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <UnverifiedOrganizationPage organization={organization} />
            );
        }

        if (!posts.data) {
            return (
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/gray/success.svg"
                        width={400}
                        height={400}
                        className="dark:hidden"
                    />
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/white/success.svg"
                        width={400}
                        height={400}
                        className="hidden dark:block"
                    />
                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                        No posts yet.
                    </p>
                </div>
            )
        } else if (posts.data) {
            return (
                <main className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-4">
                    <NewPostDialog/>
                    <PostList posts={posts.data}/>
                </main>
            )
        }
    } else {
        return (
            <NoOrganization/>
        );
    }
}
