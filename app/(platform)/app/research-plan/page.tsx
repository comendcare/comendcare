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
import { CreateEmptyResearchPlanCard, CreateResearchPlanFromTemplateCard, ResearchPlanTemplatesCard } from "@/components/roadmap-templates";
import { ResearchPlansDataTable } from "@/components/research-plans-data-table/research-plans-data-table";
import { columns } from "@/components/research-plans-data-table/research-plans-data-columns"
import NoResearchPlans from "@/components/no-research-plans";

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
            <div className="p-6 w-full">
                <h2 className="col-span-full font-semibold text-2xl">Research Plans</h2>
                {roadmaps.length > 0 && (
                    <ResearchPlansDataTable data={roadmaps} columns={columns}/>
                )}
                {roadmaps.length === 0 && (
                    <NoResearchPlans />
                )}
            </div>
        </main>
    )
}
