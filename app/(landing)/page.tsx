"use client"
import {ComingSoonSection} from "@/components/layout/sections/coming-soon-section";
import {FeaturesSection} from "@/components/layout/sections/features";
import {FooterSection} from "@/components/layout/sections/footer";
import {HeroSection} from "@/components/layout/sections/hero";
import {PricingSection} from "@/components/layout/sections/pricing";
import {ServicesSection} from "@/components/layout/sections/services";
import {TestimonialSection} from "@/components/layout/sections/testimonial";
import {WhoSection} from "@/components/layout/sections/who";
import TabsFeaturesSection from "@/components/layout/sections/tabs-features";
import HowItWorks from "@/components/layout/sections/how-it-works";
import LandingFooter from "@/components/layout/sections/landing-footer";
import CTASection from "@/components/layout/sections/cta";
import {LibrareySection} from "@/components/layout/sections/librarey-section";
import {StatsSection} from "@/components/layout/sections/stats-section";
import {ScimanticSection} from "@/components/layout/sections/scimantic-section";
import WhatElseSection from "@/components/layout/sections/what-else-section";
import {CloudHeroSection} from "@/components/layout/sections/cloud-hero";

export default function App() {
    return (
        <>
            {/*<HeroSection/>*/}
            <CloudHeroSection/>
            {/*<HowItWorks/>*/}
            <TabsFeaturesSection/>
            {/*<WhoSection/>*/}
            {/*<FeaturesSection/>*/}
            <StatsSection/>
            <ComingSoonSection/>
            {/*<FAQSection/>*/}
            {/*<FooterSection/>*/}
            {/*<WhatElseSection/>*/}
            {/*<LibrareySection/>*/}
            {/*<ScimanticSection/>*/}
            <CTASection/>
            <LandingFooter/>
        </>
    );
}
