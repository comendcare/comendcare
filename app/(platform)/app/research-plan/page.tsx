import {getOrganizationFromOrganizationId, getRoadmap, getRoadmaps} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import NoOrganization from "@/components/no-organization";
import { Roadmap } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RoadmapPage() {
    const session = await getSession();
    const orgId = session?.user.organizationId;

    if (!orgId) {
        return <NoOrganization />
    }

    let roadmaps: Roadmap[] = []

    const response = await getRoadmaps(orgId)
    if (response.success && response.data) {
        roadmaps = response.data
    }

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            {/* <Roadmap /> */}
            <div className="bg-blue-100 w-full">
                <h1>Research Plan Templates</h1>

            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <h2 className="col-span-full">Research Plans</h2>
                {roadmaps.map(roadmap => (
                    <Link
                        href={`/app/research-plan/${roadmap.id}`}
                    >
                        <Button>
                            {roadmap.title}
                            {roadmap.id}
                        </Button>
                    </Link>
                ))}
                {roadmaps.length === 0 && (
                    <p>This org has no roadmaps...</p>
                )}
            </div>
        </main>
    )
}
