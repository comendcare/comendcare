"use client"

import CTASection from "@/components/layout/sections/cta";
import LandingFooter from "@/components/layout/sections/landing-footer";
import React, {useEffect, useState} from "react";
import ContactSection from "@/components/layout/sections/contact";


export default function PublicPageFooter() {
    return (
        <>
            <ContactSection />
            <LandingFooter/>
        </>
    )
}
