import LandingFooter from "./landing/landing-footer";
import React, {useEffect, useState} from "react";
import ContactSection from "./landing/contact";
import {Separator} from "@/packages/components/ui/separator";


export default function PublicPageFooter() {
    return (
        <>
            {/*<ContactSection />*/}
            <Separator className="max-w-7xl mx-auto mt-8" />
            <LandingFooter />
        </>
    )
}
