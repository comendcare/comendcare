"use server"
import prisma from "@comend/lib/prisma"
import {notFound} from "next/navigation"
import {
    getOrganizationData,
    getConditionsDataFromOrgId,
    getPublicRFPsForOrganization,
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
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { RFPSort } from "@comend/lib/utils";
import {TaggableType} from "@prisma/client";
import type { Metadata, ResolvingMetadata } from "next"

type Props = {
    params: { domain: string }
    searchParams: Record<string, string | string[] | undefined>
}

function absoluteUrl(pathOrUrl: string) {
    // If it's already absolute, keep it
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl

    const root = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

    return `${root.replace(/\/$/, "")}/${String(pathOrUrl).replace(/^\//, "")}`
}

function safeText(input: unknown, fallback = "") {
    if (typeof input !== "string") return fallback
    return input.trim()
}

export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const domain = decodeURIComponent(params.domain)

    // If you want to avoid duplicating logic with getOrganizationData, you can do a minimal prisma query instead.
    const organization = await getOrganizationData(domain, {
        id: true,
        name: true,
        description: true,
        statedGoal: true,
        website: true,
        logo: true,
        image: true,
        headerImage: true,
        verified: true,
        published: true,
        subdomain: true,
        customDomain: true,
    })

    if (!organization) notFound()

    // If you want unverified/unpublished pages to have different metadata, handle here.
    if (!organization.verified) {
        return {
            title: "Organization not verified",
            description: "This organization profile is not verified yet.",
            robots: { index: false, follow: false },
        }
    }

    if (!organization.published) {
        return {
            title: "Organization not published",
            description: "This organization profile is not published yet.",
            robots: { index: false, follow: false },
        }
    }

    const name = safeText(organization.name, "Organization")
    const description =
        safeText(organization.description) ||
        safeText(organization.statedGoal) ||
        `Learn about ${name} and its research priorities.`

    // Canonical URL for this profile
    const canonical = `https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`

    const url = absoluteUrl(canonical)

    // Choose best share image
    const ogImage =
        safeText(organization.headerImage) ||
        safeText(organization.image) ||
        safeText(organization.logo)

    const images = ogImage
        ? [
            {
                url: absoluteUrl(ogImage),
                width: 1200,
                height: 630,
                alt: `${name} — Organization profile`,
            },
        ]
        : undefined

    const iconUrl = safeText(organization.logo) || safeText(organization.image)

    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: organization.name,
        url,
        logo: organization.logo || undefined,
        image: organization.image || undefined,
        description:
            organization.description ||
            organization.statedGoal ||
            undefined,
        foundingDate: organization.yearFounded
            ? String(organization.yearFounded)
            : undefined,
        contactPoint: organization.contactEmail
            ? {
                "@type": "ContactPoint",
                contactType: "general",
                email: organization.contactEmail,
            }
            : undefined,
        sameAs: organization.website ? [organization.website] : undefined,
    }

    return {
        metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`),
        title: {
            default: name,
            template: `%s | ${name}`,
        },
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: "website",
            url,
            title: name,
            description,
            images,
            siteName: name,
        },
        twitter: {
            card: images ? "summary_large_image" : "summary",
            title: name,
            description,
            images: images?.map((i) => i.url),
        },
        icons: iconUrl
            ? {
                icon: absoluteUrl(iconUrl),
                apple: absoluteUrl(iconUrl),
            }
            : undefined,
        robots: {
            index: true,
            follow: true,
        },
        other: {
            "script:ld+json": JSON.stringify(schema),
        },
    }
}

interface IndexPageProps {
    params: {domain: string},
    searchParams: Record<string, string | string[] | undefined>;
}

export async function generateStaticParams() {
    const allOrganizations = await prisma.organization.findMany({
        select: {
            subdomain: true,
        }
        // feel free to remove this filter if you want to generate paths for all organizations
        // where: {
        //     subdomain: "demo",
        // },
    })

    const allPaths = allOrganizations
        .flatMap(({subdomain}) => [
            subdomain && {
                domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            },
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

    if (!organization.verified) {
        // Render unverified organization state
        return <UnverifiedOrganizationPage organization={organization}/>
    }

    if (!organization.published) {
        // Render unpublished organization state
        return <UnpublishedOrganizationPage organization={organization}/>
    }

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
            organization: {include: {
                conditions: {include: {condition: true}},
                members: true
            }},
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
                organization: {include: {
                    conditions: {include: {condition: true}},
                    members: true
                }},
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
                organization: {include: {
                    conditions: {include: {condition: true}},
                    members: true
                }},
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
                organization: {include: {
                    conditions: {include: {condition: true}},
                    members: true
                }},
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
                organization: {include: {
                    conditions: {include: {condition: true}},
                    members: true
                }},
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

    let conditions = null
    if (conditionResponse.success) {
        conditions = conditionResponse.data
    } else {
        console.error(conditionResponse.error)
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
