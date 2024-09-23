"use client"
import {ComingSoonSection} from "@/components/layout/sections/coming-soon-section";
import {FAQSection} from "@/components/layout/sections/faq";
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

export default function App() {
    return (
        <>
            <HeroSection/>
            <HowItWorks/>
            <TabsFeaturesSection/>
            {/*<WhoSection/>*/}
            {/*<FeaturesSection/>*/}
            <StatsSection/>
            <ComingSoonSection/>
            {/*<FAQSection/>*/}
            {/*<FooterSection/>*/}
            <LibrareySection/>
            <CTASection/>
            <LandingFooter/>
        </>
    );
}
