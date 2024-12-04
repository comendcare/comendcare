"use client"

import CTASection from "@/components/layout/sections/cta";
import LandingFooter from "@/components/layout/sections/landing-footer";
import React, {useEffect, useState} from "react";


export default function ConditionProfileFooter() {
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false)

    useEffect(() => {
        const data = localStorage.getItem("isSubscribedBeta")
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
            <CTASection
                isSubscribedCallback={betaSubscribeCallback}
                isSubscribed={isSubscribed}
            />
            <LandingFooter/>
        </>
    )
}