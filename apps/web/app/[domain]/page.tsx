"use server"
import prisma from "@comend/lib/prisma"
import {notFound} from "next/navigation"
import {
    getOrganizationData,
    getConditionsDataFromOrgId,
    getPublicRFPsForOrganization,
    getPublicRoadmapsForOrganization,
    getPublicToolCountsForOrganization,
    getBiosamples,
    getDiseaseModels,
    getClinicalDatasets, getTagsForEntity,
    getResearchPlans
} from "@comend/lib/fetchers"
import PAGPublicProfileHeader from "~web/components/pag-public-profile-header";
import {RoadmapsCard} from "~web/components/public-roadmap-card";
import {PagProfileAboutCard} from "~web/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "~web/components/pag-profile-conditions-card";
import {FloatingDock} from "~web/components/floating-dock";
import ShareDialog from "~web/components/share-dialog";
import UnverifiedOrganizationPage from "~web/components/unverified-organization-page";
import {PAGProfileRFPsHoverableCard} from "@comend/components/pag-profile-rfps-card";
import React from "react";
import UnpublishedOrganizationPage from "~web/components/unpublished-organization-page";
import {Mail, Share} from "lucide-react";
import { PAGProfileToolsCard } from "~web/components/pag-profile-tools-card";
import { SearchParams } from "@comend/components/types";
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { RFPSort } from "@comend/lib/utils";
import {TaggableType} from "@prisma/client";
import { authOptions } from "@comend/lib/auth";
import { getServerSession } from "next-auth";

interface IndexPageProps {
    params: {domain: string},
    searchParams: Record<string, string | string[] | undefined>;
}

export async function generateStaticParams() {
    const allOrganizations = await prisma.organization.findMany({
        select: {
            subdomain: true,
            customDomain: true
        }
        // feel free to remove this filter if you want to generate paths for all organizations
        // where: {
        //     subdomain: "demo",
        // },
    })

    const allPaths = allOrganizations
        .flatMap(({subdomain, customDomain}) => [
            subdomain && {
                domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            },
            customDomain && {
                domain: customDomain
            }
        ])
        .filter(Boolean)
    return allPaths
}

export default async function OrganizationHomePage(props: IndexPageProps) {
    const searchParams = await props.searchParams
    const domain = decodeURIComponent(props.params.domain)
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const organization = await getOrganizationData(domain, {
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
        members: true,
    })

    if (!organization) notFound()

    const [
        toolCounts, 
        rfps, 
        conditionResponse,
        {data: biosamples, pageCount: biosamplesPageCount},
        {data: diseaseModels, pageCount: diseaseModelsPageCount},
        {data: clinicalDatasets, pageCount: clinicalDatasetsPageCount},
        {data: researchPlans, pageCount: researchPlansPageCount}
    ] = await Promise.all([
        getPublicToolCountsForOrganization(domain),
        getPublicRFPsForOrganization(domain, {
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
        getConditionsDataFromOrgId(organization.id, {
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
            biomarkers: true,
        }),
        getBiosamples(
            organization?.id,
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
            organization?.id,
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
            organization?.id,
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
            },
            undefined,
            true,
        )
    ])

    let conditions = null
    if (conditionResponse.success) {
        conditions = conditionResponse.data
    } else {
        console.error(conditionResponse.error)
    }

    if (!organization.verified) {
        // Render unverified organization state
        return (
            <UnverifiedOrganizationPage organization={organization}/>
        );
    }

    if (!organization.published) {
        // Render unpublished organization state
        return (
            <UnpublishedOrganizationPage organization={organization}/>
        );
    }

    let conditionTags: string[] = []
    if (conditions) {
        const tagsResult = await getTagsForEntity(
            TaggableType.CONDITION,
            conditions?.[0]?.id
        );

        conditionTags = tagsResult.success
            ? tagsResult.data?.map(t => t.value) ?? []
            : [];
    }

    return (
        <>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto mt-16 gap-4">
                <div className="col-span-8 flex flex-col items-center space-y-8 px-4 lg:px-0">
                    <PAGPublicProfileHeader organization={organization}/>

                    <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="relative md:col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PAGProfileConditionsCard
                                    conditions={conditions}
                                    showEditDialog={false}
                                    conditionTags={conditionTags}
                                />
                                <PagProfileAboutCard
                                    organization={organization as any}
                                    editable={false}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col space-y-4">
                            {(rfps.length > 0) && (
                                <PAGProfileRFPsHoverableCard
                                    isPrivate={false}
                                    rfps={RFPSort(rfps)}
                                />
                            )}
                            <RoadmapsCard 
                                researchPlans={researchPlans}
                                researchPlansPageCount={researchPlansPageCount}
                                searchParams={searchParams}
                                organization={organization}
                            />
                            {/* tools card handles it's own data state via zustand - necessary for pagination to work properly */}
                            {(
                                toolCounts.biosampleCount > 0 || 
                                toolCounts.diseaseModelCount > 0 || 
                                toolCounts.clinicalDatasetCount > 0
                            ) && 
                                <PAGProfileToolsCard 
                                    organization={organization as any} 
                                    toolCounts={toolCounts} 
                                    searchParams={searchParams}
                                    biosamples={biosamples}
                                    biosamplesPageCount={biosamplesPageCount}
                                    diseaseModels={diseaseModels}
                                    diseaseModelsPageCount={diseaseModelsPageCount}
                                    clinicalDatasets={clinicalDatasets}
                                    clinicalDatasetsPageCount={clinicalDatasetsPageCount}
                                />
                            }
                        </div>
                    </div>
                </div>
            </main>

            <FloatingDock
                items={[
                    {
                        title: "Share on social media",
                        icon: <Share />,
                        dialog: (
                            <ShareDialog
                                url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                organization={organization}
                                trackShareEvent={{
                                    title: `Organization Profile Shared`
                                }}
                            />
                        ),
                    },
                    ...(organization.contactEmail
                        ? [
                            {
                                title: "Contact patient group",
                                icon: <Mail/>,
                                href: `mailto:${organization.contactEmail}`
                            },
                        ]
                        : []),
                ]}
                orientation="vertical"
                desktopClassName="right-4"
            />
        </>
    )
}
