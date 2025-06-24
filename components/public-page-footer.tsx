"use client"

import CTASection from "../apps/web/components/landing/cta";
import LandingFooter from "../apps/web/components/landing/landing-footer";
import React, {useEffect, useState} from "react";
import ContactSection from "../apps/web/components/landing/contact";


export default function PublicPageFooter() {
    return (
        <>
            <ContactSection />
            <LandingFooter/>
        </>
    )
}
