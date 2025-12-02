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
import MarketplacePage from "~web/app/(platform)/app/marketplace/page";

export default function App() {
    return (
        <>
            {/*<HeroSection/>*/}
            <CloudHeroSection/>
            <LogoInfiniteCarousel/>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <MarketplacePage/>
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
