import {getOrganizationFromOrganizationId, getRoadmap, getRoadmaps} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import NoOrganization from "@/components/no-organization";
import { Roadmap } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { templateResearchPlans } from "@/lib/templates";
import { createRoadmap } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { CreateEmptyResearchPlanCard, CreateResearchPlanFromTemplateCard } from "@/components/roadmap-templates";

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
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            <ResearchPlanTemplatesCard orgId={orgId} />
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

export const ResearchPlanTemplatesCard = ({orgId}: {orgId: string}) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    Research Plan Templates
                </CardTitle>
                <CardDescription>Create a research plan from one of our curated templates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <CreateEmptyResearchPlanCard orgId={orgId} />
                {templateResearchPlans.map(plan => (
                    <CreateResearchPlanFromTemplateCard plan={plan} orgId={orgId}/>
                ))}
            </CardContent>
        </Card>
    )
}
