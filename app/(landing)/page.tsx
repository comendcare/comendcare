"use client"
import { useEffect, useState } from "react";
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
import {BetaSignup} from "@/components/beta-signup";
import JoinWaitlistSection from "@/components/layout/sections/join-waitlist-section";

export default function App() {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)

    useEffect(() => {
        const data = localStorage.getItem("isSubscribedBeta");
        if (data) {
            setIsSubscribed(data === "true")
        }
    }, [])

    const betaSubscribeCallback = async () => {
        localStorage.setItem("isSubscribedBeta", "true")
        setIsSubscribed(true)
    }

    return (
        <>
            {/*<HeroSection/>*/}
            <CloudHeroSection/>
            <JoinWaitlistSection isSubscribedCallback={betaSubscribeCallback} isSubscribed={isSubscribed}/>
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
            <CTASection isSubscribedCallback={betaSubscribeCallback} isSubscribed={isSubscribed}/>
        </>
    );
}
