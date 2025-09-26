import NoOrganization from "~web/components/no-organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
import PAGProfilePage from "~web/components/profile-page";
import {
    getConditionsDataFromOrgId,
    getPublicRFPsForOrganization,
    getPublicRoadmapsForOrganization,
    getPublicToolCountsForOrganization
} from "@comend/lib/fetchers";

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Record<string, string | string[] | undefined>; // <- not Promise
}

type ToolCounts = {
    biosampleCount: number;
    diseaseModelCount: number;
    clinicalDatasetCount: number;
};

export default async function ProfilePage(_props: IndexPageProps) {
    const session = await getServerSession(authOptions);
    const orgId = session?.user?.organizationId;
    if (!orgId) return <NoOrganization />;

    // 1) Organization (server/prisma)
    const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        select: {
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
            createdAt: true,
            updatedAt: true,
            userId: true,
            members: {
                select: {
                    user: true
                }
            }
            // include only what you actually render
        },
    });

    if (!organization) return <NoOrganization />;

    // 2) Conditions (server)
    const conditions = await getConditionsDataFromOrgId(orgId, {
        id: true,
        name: true,
        summary: true,
        prevalenceNumerator: true,
        prevalenceDenominator: true,
        numberOfPatientsEngaged: true,
        nationalEstimatedPopulation: true,
        globalEstimatedPopulation: true,
        diseaseCategories: true,
        causalGenes: true,
        associatedGenes: true,
        description: true,
        associatedSystems: true,
        associatedConditions: true,
        associatedWith: true,
    });

    // 3) Public data keyed by subdomain (server)
    const subdomain = organization.subdomain ?? null;
    const [roadmaps, toolCountsRaw, rfps] = subdomain
        ? await Promise.all([
            getPublicRoadmapsForOrganization(subdomain, {
                id: true,
                title: true,
                description: true,
                slug: true,
                edges: true,
                milestones: true,
                nodes: true,
                modalities: true,
            }),
            getPublicToolCountsForOrganization(subdomain),
            getPublicRFPsForOrganization(subdomain, {
                id: true,
                title: true,
                description: true,
                openTo: true,
                startDate: true,
                endDate: true,
                budget: true,
                headerImage: true,
                contacts: true,
                attachments: true,
                milestones: true,
                organizationId: true,
                organization: true
            }),
        ])
        : [[], {}, []];

    const isOwner = session?.user?.membership?.role === "owner";

    const safeOrg = {
        ...organization,
        createdAt: organization.createdAt?.toISOString?.() ?? organization.createdAt,
        updatedAt: organization.updatedAt?.toISOString?.() ?? organization.updatedAt,
    };

    const toolCounts: ToolCounts = {
        biosampleCount: Number((toolCountsRaw as any)?.biosampleCount ?? 0),
        diseaseModelCount: Number((toolCountsRaw as any)?.diseaseModelCount ?? 0),
        clinicalDatasetCount: Number((toolCountsRaw as any)?.clinicalDatasetCount ?? 0),
    };

    return (
        <PAGProfilePage
            organization={safeOrg}
            conditions={conditions?.success ? conditions.data : []}
            roadmaps={roadmaps}
            toolCounts={toolCounts}
            rfps={rfps}
            isOwner={!!isOwner}
            rootDomain={process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "comend.io"}
        />
    );
}
