"use client"

import { mixpanelTrack } from "@/app/mixpanel"
import mixpanel from "mixpanel-browser"
import { useEffect } from "react"

export const ProfileCompletionMixpanelTrack = ({
    completionPercentage
}: {
    completionPercentage: number
}) => {
    // mixpanel tracking for profile completion is in it's own client component, so it doesn't cause any 
    // weird reloading behaviour in the profile Server Components
    useEffect(() => {
        if (!localStorage.getItem("profile-complete") && completionPercentage) {
            mixpanelTrack("Organization Profile Completed")
            localStorage.setItem("profile-complete", "true")
        }
    }, [])

    return <></>
}