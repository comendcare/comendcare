"use client"
import {BenefitsSection} from "@/components/layout/sections/benefits";
import {FAQSection} from "@/components/layout/sections/faq";
import {FeaturesSection} from "@/components/layout/sections/features";
import {FooterSection} from "@/components/layout/sections/footer";
import {HeroSection} from "@/components/layout/sections/hero";
import {PricingSection} from "@/components/layout/sections/pricing";
import {ServicesSection} from "@/components/layout/sections/services";
import {TestimonialSection} from "@/components/layout/sections/testimonial";
import {WhoSection} from "@/components/layout/sections/who";
import {PAGSection} from "@/components/layout/sections/pags";
import {ProjectsSection} from "@/components/layout/sections/projects";
import {GrantsSection} from "@/components/layout/sections/grants";
import {ResearchersSection} from "@/components/layout/sections/researchers";
import TabsFeaturesSection from "@/components/layout/sections/tabs-features";
import {ContractorsSection} from "@/components/layout/sections/contractors";
import HowItWorks from "@/components/layout/sections/how-it-works";

export default function Home() {
    return (
        <>
            <HeroSection/>
            <HowItWorks/>
            <TabsFeaturesSection/>
            {/*<PAGSection/>*/}
            {/*<ProjectsSection/>*/}
            {/*<ResearchersSection/>*/}
            {/*<GrantsSection/>*/}
            {/*<ContractorsSection/>*/}
            {/*<WhoSection/>*/}
            {/*<FeaturesSection/>*/}
            <BenefitsSection/>
            <FAQSection/>
            <FooterSection/>
        </>
    );
}
