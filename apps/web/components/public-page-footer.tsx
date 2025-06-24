"use client"

import CTASection from "./landing/cta";
import LandingFooter from "./landing/landing-footer";
import React, {useEffect, useState} from "react";
import ContactSection from "./landing/contact";


export default function PublicPageFooter() {
    return (
        <>
            <ContactSection />
            <LandingFooter/>
        </>
    )
}
