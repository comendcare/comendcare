// "use client"
// import React, { useEffect, useState } from "react"
// import { ComingSoonSection } from "@/components/layout/sections/coming-soon-section"
// import { FeaturesSection } from "@/components/layout/sections/features"
// import { HeroSection } from "@/components/layout/sections/hero"
// import { ServicesSection } from "@/components/layout/sections/services"
// import { WhoSection } from "@/components/layout/sections/who"
// import TabsFeaturesSection from "@/components/layout/sections/tabs-features"
// import HowItWorks from "@/components/layout/sections/how-it-works"
// import CTASection from "@/components/layout/sections/cta"
// import { LibrareySection } from "@/components/layout/sections/librarey-section"
// import { StatsSection } from "@/components/layout/sections/stats-section"
// import { ScimanticSection } from "@/components/layout/sections/scimantic-section"
// import WhatElseSection from "@/components/layout/sections/what-else-section"
import { CloudHeroSection } from "@/components/layout/sections/cloud-hero"
// import { BetaSignup } from "@/components/beta-signup"
// import JoinWaitlistSection from "@/components/layout/sections/join-waitlist-section"
// import MoreFeaturesSection from "@/components/layout/sections/more-features-section";
// import {PartneredWithLogoCloud} from "@/components/layout/sections/partnered-with-logo-cloud";
// import {ClientsLogoCloud} from "@/components/layout/sections/clients-logo-cloud";
import ContactSection from "@/components/layout/sections/contact";
import FeatureResearchMarketplace from "@/components/layout/sections/feature-research-marketplace";
import FeaturePublicPages from "@/components/layout/sections/feature-public-pages";
import FeatureResearchPlan from "@/components/layout/sections/feature-research-plan";
import {News} from "@/components/layout/sections/news";

export default function App() {
    // const [isSubscribed, setIsSubscribed] = useState<boolean>(false)

    // useEffect(() => {
    //     const data = localStorage.getItem("isSubscribedBeta")
    //     if (data) {
    //         setIsSubscribed(data === "true")
    //     }
    // }, [])

    // const betaSubscribeCallback = async () => {
    //     localStorage.setItem("isSubscribedBeta", "true")
    //     setIsSubscribed(true)
    // }

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
            <FeatureResearchPlan />
            <FeatureResearchMarketplace  />
            <FeaturePublicPages />
            {process.env.NEXT_PUBLIC_NODE_ENV !== 'production' && <News />}
            {/*<TabsFeaturesSection />*/}
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
            <ContactSection />
        </>
    )
}
