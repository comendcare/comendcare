// "use client"
// import React, { useEffect, useState } from "react"
// import { ComingSoonSection } from "@/components/landing/sections/coming-soon-section"
// import { FeaturesSection } from "@/components/landing/sections/features"
// import { HeroSection } from "@/components/landing/sections/hero"
// import { ServicesSection } from "@/components/landing/sections/services"
import { WhoSection } from "~web/components/landing/who"
// import TabsFeaturesSection from "@/components/landing/sections/tabs-features"
// import HowItWorks from "@/components/landing/sections/how-it-works"
// import CTASection from "@/components/landing/sections/cta"
// import { LibrareySection } from "@/components/landing/sections/librarey-section"
// import { StatsSection } from "@/components/landing/sections/stats-section"
// import { ScimanticSection } from "@/components/landing/sections/scimantic-section"
// import WhatElseSection from "@/components/landing/sections/what-else-section"
import { CloudHeroSection } from "~web/components/landing/cloud-hero"
// import { BetaSignup } from "@/components/beta-signup"
// import JoinWaitlistSection from "@/components/landing/sections/join-waitlist-section"
// import MoreFeaturesSection from "@/components/landing/sections/more-features-section";
// import {PartneredWithLogoCloud} from "@/components/landing/sections/partnered-with-logo-cloud";
// import {ClientsLogoCloud} from "@/components/landing/sections/clients-logo-cloud";
import ContactSection from "~web/components/landing/contact";
import FeatureResearchMarketplace from "~web/components/landing/feature-research-marketplace";
import FeaturePublicPages from "~web/components/landing/feature-public-pages";
import FeatureResearchPlan from "~web/components/landing/feature-research-plan";
import {News} from "~web/components/landing/news";

export default function App() {
    return (
        <>
            {/*<HeroSection/>*/}
            <CloudHeroSection />
            {/*<JoinWaitlistSection*/}
            {/*    isSubscribedCallback={betaSubscribeCallback}*/}
            {/*    isSubscribed={isSubscribed}*/}
            {/*/>*/}
            {/*<HowItWorks/>*/}
            {/*<ClientsLogoCloud />*/}
            {/*<FeatureResearchPlan />*/}
            {/*<FeatureResearchMarketplace  />*/}
            {/*<FeaturePublicPages />*/}
            {/*<TabsFeaturesSection />*/}
            {/*<MoreFeaturesSection />*/}
            <WhoSection/>
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
            <News />
            <ContactSection />
        </>
    )
}
