import NoOrganization from "~web/components/no-organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@comend/lib/auth";
import prisma from "@comend/lib/prisma";
import PAGProfilePage from "~web/components/profile-page";
import {
    getBiosamples,
    getConditionsDataFromOrgId,
    getClinicalDatasets,
    getDiseaseModels,
    getPublicRFPsForOrganization,
    getPublicRoadmapsForOrganization,
    getPublicToolCountsForOrganization, getTagsForEntity,
    getResearchPlans
} from "@comend/lib/fetchers";
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import { getValidFilters } from "@comend/lib/data-table";
import { RFPSort } from "@comend/lib/utils";
import {Biosample, TaggableType} from "@prisma/client";

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Record<string, string | string[] | undefined>; // <- not Promise
}

type ToolCounts = {
    biosampleCount: number;
    diseaseModelCount: number;
    clinicalDatasetCount: number;
};

export default async function ProfilePage(props: IndexPageProps) {
    const searchParams = props.searchParams
    const session = await getServerSession(authOptions);
    const orgId = session?.user?.organizationId;
    if (!orgId) return <NoOrganization />;

    // const session = await getSession()
    // const orgId = session?.user.organizationId
    // const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    // Phase 1: kick off everything that only needs orgId, in parallel
    const organizationPromise = prisma.organization.findUnique({
        where: { id: orgId },
        select: {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            patientPriorities: true,
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
            members: { select: { user: true } },
        },
    });

    const conditionsPromise = getConditionsDataFromOrgId(orgId, {
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
        associatedSignsAndSymptoms: true,
        biomarkers: true,
    });

    const [organization, conditions] = await Promise.all([
        organizationPromise,
        conditionsPromise,
    ]);

    if (!organization) return <NoOrganization />;

    // 3) Public data keyed by subdomain (server)
    const subdomain = organization.subdomain ?? null;
    const [
        toolCountsRaw, 
        rfps,
        {data: biosamples, pageCount: biosamplesPageCount},
        {data: diseaseModels, pageCount: diseaseModelsPageCount},
        {data: clinicalDatasets, pageCount: clinicalDatasetsPageCount},
        {data: researchPlans, pageCount: researchPlansPageCount}
    ] = subdomain
        ? await Promise.all([
            getPublicToolCountsForOrganization(subdomain),
            getPublicRFPsForOrganization(subdomain, {
                id: true,
                title: true,
                description: true,
                eligibility: true,
                instructions: true,
                evaluationProcess: true,
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
            getBiosamples(
                organization.id,
                {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    description: true,
                    contacts: true,
                    attachments: true,
                    private: true,
                    types: true,
                    genotype: true,
                    variant: true,
                    availability: true,
                    quantity: true,
                    quantityUnit: true,
                    currentCountry: true,
                    countryOfCollection: true,
                    preservationMethod: true,
                    anatomicalSite: true,
                    methodOfTransport: true,
                    collectionDate: true,
                    ageAtCollection: true,
                    price: true,
                    priceUnit: true,
                    notes: true,

                    milestones: {include: {milestone: true}},
                    donorId: true,
                    donor: {
                        include: {
                            diagnoses: {
                                include: {type: true}
                            }
                        }
                    },
                    institutionId: true,
                    institution: true,
                    company: true,
                    geneId: true,
                    gene: true,
                    genes: true,
                    organizationId: true,
                    organization: true,
                    materialAndDataAccessRequests: true
                },
                {...search, q: globalFilter, filters: validFilters},
                true // public only
            ),
            getDiseaseModels(
                organization.id,
                {
                    id: true,
                    createdAt: true,
                    updatedAt: true,

                    description: true,
                    contacts: true,
                    attachments: true,
                    private: true,
                    // pinned: true,
                    // metadata: true,
                    types: true,
                    genotype: true,
                    strain: true,
                    notes: true,

                    institutionId: true,
                    institution: true,
                    company: true,
                    geneId: true,
                    gene: true,
                    genes: true,
                    conditionId: true,
                    condition: true,
                    organizationId: true,
                    organization: {include: {conditions: {include: {condition: true}}}},
                    milestones: {include: {milestone: true}},
                },
                {...search, q: globalFilter, filters: validFilters},
                true // public only
            ),
            getClinicalDatasets(
                organization.id,
                {
                    id: true,
                    createdAt: true,
                    updatedAt: true,

                    title: true,
                    cohortSize: true,
                    description: true,
                    contacts: true,
                    attachments: true,
                    private: true,
                    // pinned: true,
                    // metadata: true,
                    types: true,
                    notes: true,

                    institutionId: true,
                    institution: true,
                    company: true,
                    geneId: true,
                    gene: true,
                    genes: true,
                    organizationId: true,
                    organization: {include: {conditions: {include: {condition: true}}}},
                    milestones: {include: {milestone: true}},
                },
                {...search, q: globalFilter, filters: validFilters},
                true // public only
            ),
            getResearchPlans(
                organization.id,
                {
                    id: true,
                    title: true,
                    description: true,
                    published: true,
                    organizationId: true,
                    organization: true,
                    modalities: true,
                    stages: true,
                    statuses: true,
                    partners: true,
                    links: true,
                    milestones: {
                        where: {private: false},
                        include: {types: {include: {milestoneType: true}}}
                    }
                },
                undefined,
                true,
            )
        ])
        : [
            {}, 
            [], 
            {data: [], pageCount: 0}, 
            {data: [], pageCount: 0}, 
            {data: [], pageCount: 0}, 
            {data: [], pageCount: 0}
        ];

    const isOwner = ["owner", "support"].includes(session?.user?.membership?.role);

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

    let conditionTags: string[] = []
    if (conditions) {
        const unpackedConditions = conditions?.success ? conditions.data : []
        const tagsResult = await getTagsForEntity(
            TaggableType.CONDITION,
            unpackedConditions?.[0]?.id
        );

        conditionTags = tagsResult.success
            ? tagsResult.data?.map(t => t.value) ?? []
            : [];
    }

    return (
        <PAGProfilePage
            organization={safeOrg}
            conditions={conditions?.success ? conditions.data : []}
            researchPlans={researchPlans}
            researchPlansPageCount={researchPlansPageCount}
            toolCounts={toolCounts}
            biosamples={biosamples}
            biosamplesPageCount={biosamplesPageCount}
            diseaseModels={diseaseModels}
            diseaseModelsPageCount={diseaseModelsPageCount}
            clinicalDatasets={clinicalDatasets}
            clinicalDatasetsPageCount={clinicalDatasetsPageCount}
            rfps={RFPSort(rfps)}
            isOwner={!!isOwner}
            rootDomain={process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "comend.io"}
            searchParams={searchParams}
            conditionTags={conditionTags}
        />
    );
}
