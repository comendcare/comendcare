// "use client"
// import React, { useEffect, useState } from "react"
// import { ComingSoonSection } from "@comend/components/landing/sections/coming-soon-section"
// import { FeaturesSection } from "@comend/components/landing/sections/features"
// import { HeroSection } from "@comend/components/landing/sections/hero"
// import { ServicesSection } from "@comend/components/landing/sections/services"
import { WhoSection } from "~web/components/landing/who"
// import TabsFeaturesSection from "@comend/components/landing/sections/tabs-features"
// import HowItWorks from "@comend/components/landing/sections/how-it-works"
// import CTASection from "@comend/components/landing/sections/cta"
// import { LibrareySection } from "@comend/components/landing/sections/librarey-section"
// import { StatsSection } from "@comend/components/landing/sections/stats-section"
// import { ScimanticSection } from "@comend/components/landing/sections/scimantic-section"
// import WhatElseSection from "@comend/components/landing/sections/what-else-section"
import { CloudHeroSection } from "~web/components/landing/cloud-hero"
// import { BetaSignup } from "@comend/components/beta-signup"
// import JoinWaitlistSection from "@comend/components/landing/sections/join-waitlist-section"
// import MoreFeaturesSection from "@comend/components/landing/sections/more-features-section";
// import {PartneredWithLogoCloud} from "@comend/components/landing/sections/partnered-with-logo-cloud";
// import {ClientsLogoCloud} from "@comend/components/landing/sections/clients-logo-cloud";
import ContactSection from "~web/components/landing/contact";
import {News} from "~web/components/landing/news";
import {ResearcherQuickFeaturesSection} from "~web/components/landing/researcher-quick-features-section";
import ResearcherMainFeatures from "~web/components/landing/researcher-main-features";
import {ResearcherHero} from "~web/components/landing/researcher-hero";
import ResearcherStatsSection from "~web/components/landing/researcher-stats-section";

export default function App() {
    return (
        <>
            <ResearcherHero />
            <ResearcherMainFeatures />
            {/*<ResearcherStatsSection />*/}
            {/*<ResearcherQuickFeaturesSection />*/}
            {/*<News />*/}
            {/*<ContactSection />*/}
        </>
    )
}
