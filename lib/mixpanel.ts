"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import mixpanel from "mixpanel-browser"

export default function AnalyticsScripts() {
    // const { data: session, status } = useSession()
    const [isMixpanelInitialized, setIsMixpanelInitialized] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
            try {
                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
                    debug: process.env.NEXT_PUBLIC_NODE_ENV === "development",
                    track_pageview: true,
                    persistence: "localStorage"
                })
                console.log("Mixpanel initialized")
                setIsMixpanelInitialized(true)
            } catch (error) {
                console.error("Mixpanel initialization failed:", error)
            }
        } else {
            console.error("Mixpanel token is not defined")
        }
    }, [])

    // useEffect(() => {
    //     if (isMixpanelInitialized && session?.user?.id) {
    //         mixpanel.identify(session.user.id)
    //         mixpanel.people.set({
    //             $name: session.user.name,
    //             $email: session.user.email
    //         })
    //     }
    // }, [isMixpanelInitialized, session])

    useEffect(() => {
        if (isMixpanelInitialized) {
            mixpanel.track(`User navigates to ${pathname}`)
        }
    }, [isMixpanelInitialized, pathname])

    return null
}
