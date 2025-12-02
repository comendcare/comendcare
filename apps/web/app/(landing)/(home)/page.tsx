// "use client"
// import React, { useEffect, useState } from "react"
// import { ComingSoonSection } from "@comend/components/landing/sections/coming-soon-section"
// import { FeaturesSection } from "@comend/components/landing/sections/features"
// import { HeroSection } from "@comend/components/landing/sections/hero"
// import { ServicesSection } from "@comend/components/landing/sections/services"
// import { WhoSection } from "@comend/components/landing/sections/who"
// import VerticalTimedTabsFeaturesSection from "~web/components/landing/vertical-timed-tabs-features"
// import HowItWorks from "@comend/components/landing/sections/how-it-works"
// import CTASection from "@comend/components/landing/sections/cta"
// import { LibrareySection } from "@comend/components/landing/sections/librarey-section"
// import { StatsSection } from "@comend/components/landing/sections/stats-section"
// import { ScimanticSection } from "@comend/components/landing/sections/scimantic-section"
// import WhatElseSection from "@comend/components/landing/sections/what-else-section"
import {CloudHeroSection} from "~web/components/landing/cloud-hero"
// import { BetaSignup } from "@comend/components/beta-signup"
// import JoinWaitlistSection from "@comend/components/landing/sections/join-waitlist-section"
// import MoreFeaturesSection from "@comend/components/landing/sections/more-features-section";
// import {PartneredWithLogoCloud} from "@comend/components/landing/sections/partnered-with-logo-cloud";
// import {ClientsLogoCloud} from "@comend/components/landing/sections/clients-logo-cloud";
import ContactSection from "~web/components/landing/contact";
import FeatureResearchMarketplace from "~web/components/landing/feature-research-marketplace";
import FeaturePublicPages from "~web/components/landing/feature-public-pages";
import FeatureResearchPlan from "~web/components/landing/feature-research-plan";
import FeatureFeed from "~web/components/landing/feature-feed";
import {News} from "~web/components/landing/news";
import LogoInfiniteCarousel from "~web/components/landing/logo-infinite-carousel";
import {HorizontalTabsFeatures} from "~web/components/landing/horizontal-tabs-feature";
import MarketplacePage from "../marketplace/page";
import { SearchParams } from "@comend/components/types";
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { getBiosamples, getClinicalDatasets, getDiseaseModels } from "@comend/lib/fetchers";
import MarketplaceExplorePage from "~web/app/(platform)/app/marketplace/marketplace-explore";
import { FeatureFlagsProvider } from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function App(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const biosampleColumns = useBiosamplesTableColumns(true, true, false)
    const diseaseModelColumns = useDiseaseModelsTableColumns(true, true, false)
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(true, true, false)

    const {data: biosampleData} = await getBiosamples(
        undefined,
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
            organization: {include: {conditions: {include: {condition: true}}}},
            materialAndDataAccessRequests: true
        },
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        biosampleColumns,
    )

    const {data: diseaseModelData} = await getDiseaseModels(
        undefined,
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
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        diseaseModelColumns
    )

    const {data: clinicalDatasetData} = await getClinicalDatasets(
        undefined,
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
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        clinicalDatasetColumns
    )

    return (
        <>
            {/*<HeroSection/>*/}
            <CloudHeroSection/>
            <LogoInfiniteCarousel/>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* <MarketplacePage/> */}
                <FeatureFlagsProvider>
                <MarketplaceExplorePage 
                    isExternal={true}
                    biosampleData={biosampleData}
                    diseaseModelData={diseaseModelData}
                    clinicalDatasetData={clinicalDatasetData}
                    searchParams={searchParams} 
                />
                </FeatureFlagsProvider>
            </div>
            {/*<JoinWaitlistSection*/}
            {/*    isSubscribedCallback={betaSubscribeCallback}*/}
            {/*    isSubscribed={isSubscribed}*/}
            {/*/>*/}
            {/*<HowItWorks/>*/}
            {/*<ClientsLogoCloud />*/}
            {/*<HorizontalTabsFeatures/>*/}
            {/*<FeatureResearchPlan />*/}
            {/*<FeaturePublicPages/>*/}
            {/*<FeatureResearchMarketplace/>*/}
            {/*<FeatureFeed/>*/}
            {/*<VerticalTimedTabsFeaturesSection />*/}
            {/*<MoreFeaturesSection />*/}
            {/*<WhoSection/>*/}
            {/*<FeaturesSection/>*/}
            {/*<StatsSection />*/}
            {/*<ComingSoonSection />*/}
            {/*<FAQSection/>*/}
            {/*<WhatElseSection />*/}
            {/*<LibrareySection />*/}
            {/*<ScimanticSection />*/}
            {/*<CTASection*/}
            {/*    isSubscribedCallback={betaSubscribeCallback}*/}
            {/*    isSubscribed={isSubscribed}*/}
            {/*/>*/}
            {/*<ContactSection/>*/}
        </>
    )
}
