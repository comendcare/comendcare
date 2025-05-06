"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import mixpanel from "mixpanel-browser"
import { useSession } from "next-auth/react"
import { customerIOIdentify } from "@/lib/customer-io"
import { getOrganizationFromOrganizationId, getUser } from "@/lib/fetchers"
import { getSessionInfo } from "@/lib/actions"

const MixpanelContext = createContext<any>(null)

export const useMixpanelContext = () => {
    const context = useContext(MixpanelContext)
    if (!context) {
        throw new Error("useMixpanelContext must be used within a MixpanelProvider")
    }
    return context
}

export const mixpanelTrack = (name: string, properties?: Object) => {
    if (process.env.NEXT_PUBLIC_NODE_ENV == 'production' || process.env.NEXT_PUBLIC_MIXPANEL_ENABLED == 'true') {
        try {
            mixpanel.track(name, properties)
        } catch(e) {
            console.error(`Error tracking mixpanel event: ${e}`)
        }
    } else {
        console.log(`Mixpanel event not tracked: Mixpanel is currently not enabled in your pre-production environment. Update the NEXT_PUBLIC_MIXPANEL_ENABLED flag to enable/disable mixpanel tracking.`)
    }
}

export const mixpanelReset = () => {
    if (process.env.NEXT_PUBLIC_NODE_ENV == 'production' || process.env.NEXT_PUBLIC_MIXPANEL_ENABLED == 'true') {
        try {
            mixpanel.reset()
        } catch(e) {
            console.error(`Error tracking mixpanel event: ${e}`)
        }
    } else {
        console.log(`Mixpanel event not tracked: Mixpanel is currently not enabled in your pre-production environment. Update the NEXT_PUBLIC_MIXPANEL_ENABLED flag to enable/disable mixpanel tracking.`)
    }
}

export const MixpanelProvider = ({ children }: { children: any }) => {
    const { data: session, status } = useSession()
    const [isMixpanelInitialized, setIsMixpanelInitialized] = useState(false)
    const pathname = usePathname()
    const prevSessionRef: React.MutableRefObject<typeof session | undefined | null> = useRef()

    // distinctId is used to track this user in mixpanel, and sync user profiles across
    // customer.io and mixpanel events
    const [mixpanelContext, setMixpanelContext] = useState<{
        distinctId: string | undefined
    }>({
        distinctId: undefined
    })

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_NODE_ENV == "preview" || process.env.NEXT_PUBLIC_NODE_ENV === "development") {
            if (process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'true') {
                console.warn('Mixpanel is currently not enabled in your pre-production environment. Update the NEXT_PUBLIC_MIXPANEL_ENABLED flag to enable/disable mixpanel tracking.')
                return
            }

            if (!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV) throw new Error('Mixpanel dev token not found.')
            
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

                if (process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'true') {
                    // throw new Error('Mixpanel events are disabled in your pre-production environment. Update the MIXPANEL_ENABLED flag to enable event tracking.')
                    console.warn('Mixpanel events are disabled in your pre-production environment. Update the MIXPANEL_ENABLED flag to enable event tracking.')
                    // return
                    mixpanel.disable()
                }
            } catch (error) {
                console.error("Mixpanel (dev) initialization failed:", error)
            }
        } else if (process.env.NEXT_PUBLIC_NODE_ENV == "production") {
            if (!process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) throw new Error('Mixpanel token not found.')
            try {
                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
                    debug: false,
                    track_pageview: true,
                    persistence: "localStorage",
                    loaded: function(mixpanel) {
                        const distinctId = mixpanel.get_distinct_id()
                        setMixpanelContext({ distinctId })
                    }
                })
                console.log("Mixpanel initialized")
                setIsMixpanelInitialized(true)
            } catch (error) {
                console.error("Mixpanel initialization failed:", error)
            }
        } else {
            console.error("Error initializing mixpanel. Node environment must be 'prouction', 'preview' or 'development'")
        }
    }, [])

    useEffect(() => {
        const identifyUser = async () => {
            if (isMixpanelInitialized && session?.user?.email && session?.user?.id) {
                const userData = await getUser(session?.user?.id)
                if (userData.success && userData.data) {

                    // handle opt-opt in option
                    const mixpanelPublicToken = process.env.NEXT_PUBLIC_NODE_ENV === 'production'
                        ? process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
                        : process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV
                    
                    if (!mixpanelPublicToken) {
                        console.error(`Error: cannot identify user, mixpanel public token is missing.`)
                        mixpanel.opt_out_tracking() // opt out for safety
                        return
                    }

                    if (localStorage.getItem(`mp_${mixpanelPublicToken}_mixpanel`) === null) {
                        // if the opt-in/opt-out token is not available in localstorage, pull user connsent data from database
                        if (userData.data.consentSettings === true) {
                            mixpanel.opt_in_tracking()
                        } else {
                            mixpanel.opt_out_tracking()
                        }
                    }
 
                    if (userData.data.consentSettings) {
                        // user has consented to data tracking, opt into mixpanel tracking
                        console.log(`mixpanel identify user`, userData)
                        if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") mixpanel.identify(session.user.email) // development & preview use email as distinct id
                        else mixpanel.identify(session.user.id) // production uses userID from DB (fetched from session)
            
                        let currentOrg = undefined
                        if (session?.user?.organizationId) currentOrg = await getOrganizationFromOrganizationId(session?.user?.organizationId)
            
                        // add super properties that will apply to all tracked events
                        mixpanel.register({
                            "Environment": process.env.NEXT_PUBLIC_NODE_ENV,
                            ...(currentOrg?.success && currentOrg?.data 
                                ? {
                                    "Organization ID": currentOrg.data.id,
                                    "Organization Name": currentOrg.data.name
                                } 
                                : undefined)
                        })
            
                        mixpanel.people.set({
                            $name: session.user.name,
                            $email: session.user.email,
                        })
            
                        const distinctId = mixpanel.get_distinct_id()
                        setMixpanelContext({ distinctId })
            
                        if (session.user.email) customerIOIdentify(distinctId, session)
                    }
                }
            }

        }

        // console.log(`session:`, session, `\nauthenticated: ${status === "authenticated"}\nsession has changed: ${JSON.stringify(prevSessionRef?.current?.user) != JSON.stringify(session?.user)}`)
        if (
            status == "authenticated" &&
            session && 
            JSON.stringify(prevSessionRef?.current?.user) != JSON.stringify(session?.user)
        ) {
            console.log(`session has changed, update mixpanel identify`)
            identifyUser()
        }

        prevSessionRef.current = session
    }, [isMixpanelInitialized, session])

    // we can use Mixpanel's built in automatic page tracking instead of tracking manually
    // useEffect(() => {
    //     if (isMixpanelInitialized) {
    //         mixpanel.track(`User navigates to ${pathname}`)
    //     }
    // }, [isMixpanelInitialized, pathname])

    return (
        <MixpanelContext.Provider value={({ mixpanelContext })}>
            {children}
        </MixpanelContext.Provider>
    )
}