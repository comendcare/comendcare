import {getSession} from "@comend/lib/auth";
import {fetchFeedPage, getOrganizationFromOrganizationId, getPosts} from "@comend/lib/fetchers";
import UnverifiedOrganizationPage from "~web/components/unverified-organization-page";
import NoOrganization from "~web/components/no-organization";
import Image from "next/image";
import {toast} from "sonner";
import {FeedList} from "~web/components/feed/feed-list";
import {FeedPageDTO} from "@comend/lib/types";
import {Separator} from "@comend/components/ui/separator"

export default async function FeedPage() {
    const session = await getSession()

    let organization = null
    try {
        if (session?.user.organizationId) {
            const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {
                id: true,
                public: true,
                verified: true,
                published: true,
                name: true,
                description: true,
                contactEmail: true,
                logo: true,
                image: true,
                headerImage: true,
                biopharmaConsentSettings: true,
                subdomain: true,
                customDomain: true,
                statedGoal: true,
                yearFounded: true,
                incorporationStatus: true,
                therapeuticsOfInterest: true,
                therapeuticsInDevelopment: true,
                website: true,
                moneyRaised: true,
                moneyDeployed: true,
                researchBudget: true,
                // address1                  String?
                // address2                  String?
                // formattedAddress          String?
                // city                      String?
                // region                    String?
                // postalCode                String?
                // country                   String?
                // lat                       String?
                // lng                       String?
                createdAt: true,
                updatedAt: true,
                user: true,
                userId: true,
                roadmaps: true,
                members: true,
                clients: true,
                invitations: true,
                membershipRequests: true,
                conditions: true,
                kanban: true,
                milestones: true,
                platformNotifications: true,
                reviews: true,
                savedCompanies: true,
                tools: true,
                rfps: true,
                metadata: true
            })
            if (response.success) {
                organization = response.data
            } else {
                console.error(response.error)
            }
        }
    } catch (error) {
        console.error(error)
        toast.error("Could not find organization.");
    }

    const posts = await getPosts({
        id: true,
        content: true,
        createdAt: true,
        text: true,
        comments: true,
        author: true,
    })
    const first = await fetchFeedPage(
        {
            orgId: session?.user.organizationId || undefined,
            cursor: null,
            limit: 10
        }
    );

    const initialPage = {
        items: first.items.map((i) => ({
            ...i,
            createdAt: i.createdAt.toISOString(),
        })),
        nextCursor: first.nextCursor
            ? {createdAt: first.nextCursor.createdAt.toISOString(), id: first.nextCursor.id}
            : null,
    };

    if (organization) {
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <UnverifiedOrganizationPage organization={organization}/>
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
                <main className="flex flex-col justify-start items-center w-full max-w-4xl mx-auto p-8 space-y-4">
                    <div className="w-full space-y-2 flex-col place-self-start">
                        <h2 className="text-xl font-semibold leading-6 text-gray-900">
                            Notifications
                        </h2>
                        <p className="text-sm text-gray-700">
                            {`Activity in your organization, and news from the rare disease world.`}
                        </p>
                        <Separator/>
                    </div>
                    <FeedList initialPage={initialPage as FeedPageDTO} orgId={session?.user.organizationId || undefined}/>
                </main>
            )
        }
    } else {
        return (
            <NoOrganization/>
        );
    }
}
