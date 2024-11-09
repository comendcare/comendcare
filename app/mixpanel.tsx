"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import mixpanel from "mixpanel-browser"
import { useSession } from "next-auth/react"
import { customerIOIdentify } from "@/lib/customer-io"

const MixpanelContext = createContext<any>(null)

export const useMixpanelContext = () => {
    const context = useContext(MixpanelContext)
    if (!context) {
        throw new Error("useMixpanelContext must be used within a MixpanelProvider")
    }
    return context
}

export const MixpanelProvider = ({ children }: { children: any }) => {
    const { data: session, status } = useSession()
    const [isMixpanelInitialized, setIsMixpanelInitialized] = useState(false)
    const pathname = usePathname()

    // distinctId is used to track this user in mixpanel, and sync user profiles across
    // customer.io and mixpanel events
    const [mixpanelContext, setMixpanelContext] = useState<{
        distinctId: string | undefined
    }>({
        distinctId: undefined
    })

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV && process.env.NEXT_PUBLIC_NODE_ENV === "development") {
            try {
                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV, {
                    debug: true,
                    track_pageview: true,
                    persistence: "localStorage",
                    loaded: function(mixpanel) {
                        const distinctId = mixpanel.get_distinct_id()
                        console.log("Mixpanel distinct_id:", distinctId)
                        setMixpanelContext({ distinctId })
                    }
                })
                console.log("Mixpanel (dev) initialized")
                setIsMixpanelInitialized(true)
            } catch (error) {
                console.error("Mixpanel (dev) initialization failed:", error)
            }
        } else if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
            try {
                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
                    debug: false,
                    track_pageview: true,
                    persistence: "localStorage",
                    loaded: function(mixpanel) {
                        const distinctId = mixpanel.get_distinct_id()
                        // console.log("Mixpanel distinct_id:", distinctId)
                        setMixpanelContext({ distinctId })
                    }
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

    useEffect(() => {
        if (isMixpanelInitialized && session?.user?.id) {
            mixpanel.identify(session.user.id)
            mixpanel.people.set({
                $name: session.user.name,
                $email: session.user.email
            })
            const distinctId = mixpanel.get_distinct_id()
            setMixpanelContext({ distinctId })

            // console.log(`identify user: `, distinctId)
            if (session.user.email) customerIOIdentify(distinctId, session)
        }
    }, [isMixpanelInitialized, session])

    useEffect(() => {
        if (isMixpanelInitialized) {
            mixpanel.track(`User navigates to ${pathname}`)
        }
    }, [isMixpanelInitialized, pathname])

    return (
        <MixpanelContext.Provider value={({ mixpanelContext })}>
            {children}
        </MixpanelContext.Provider>
    )
}