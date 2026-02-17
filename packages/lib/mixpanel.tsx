"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import mixpanel, { Config } from "mixpanel-browser"
import { useSession } from "next-auth/react"
import { getOrganizationFromOrganizationId, getUser } from "./fetchers"
import { getCookie } from "./utils"

const MIXPANEL_ALIAS_KEY = "__mp_aliased_user"

const MixpanelContext = createContext<any>(null)

interface MixpanelExtendedConfig extends Partial<Config> {
  record_heatmap_data?: boolean;
}

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
                const config: MixpanelExtendedConfig = {
                    debug: true,
                    track_pageview: true,
                    persistence: "localStorage",
                    loaded: function(mixpanel) {
                        const distinctId = mixpanel.get_distinct_id()
                        console.log("Mixpanel distinct_id:", distinctId)
                        setMixpanelContext({ distinctId })
                    },
                    // session replays currently disabled on development & preview, so we're not tracking too many of them
                    // record_sessions_percent: 100, // Session Replay enabled, recording 1% of all sessions
                    // record_idle_timeout_ms: 1800000, // End a replay capture after 30mins of inactivity
                    // record_heatmap_data: true   // Enable Heatmap data collection
                };

                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV, config)
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

            if (!(getCookie('cookieyes-consent')?.includes('analytics:yes'))) {
                // delete any existing mixpanel cookies in localStorage
                localStorage.removeItem(`__mp_opt_in_out_${process.env.NEXT_PUBLIC_MIXPANEL_TOKEN}`)
                localStorage.removeItem(`__mpq_${process.env.NEXT_PUBLIC_MIXPANEL_TOKEN}_pp`)
                localStorage.removeItem(`__mpq_${process.env.NEXT_PUBLIC_MIXPANEL_TOKEN}_ev`)
                console.warn('Mixpanel cookies have been blocked by the user. Mixpanel will not be initialized.')
                return
            }

            try {
                const config: MixpanelExtendedConfig = {
                    debug: false,
                    disable_cookie: !(getCookie('cookieyes-consent')?.includes('analytics:yes')),
                    disable_persistence: !(getCookie('cookieyes-consent')?.includes('analytics:yes')),
                    track_pageview: true,
                    persistence: "localStorage",
                    loaded: function(mixpanel) {
                        const distinctId = mixpanel.get_distinct_id()
                        setMixpanelContext({ distinctId })
                    },
                    record_sessions_percent: 100, // Session Replay enabled, recording 1% of all sessions
                    record_idle_timeout_ms: 1800000, // End a replay capture after 30mins of inactivity
                    record_heatmap_data: true   // Enable Heatmap data collection
                };

                mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, config)
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
        if (!isMixpanelInitialized || status !== "authenticated" || !session?.user?.id || !session?.user?.email) return

        const runIdentify = async () => {
            try {
                const userData = await getUser(session.user.id, {
                    id: true,
                    consentSettings: true,
                })

                if (!userData.success || !userData.data) return

                const mixpanelToken = process.env.NEXT_PUBLIC_NODE_ENV === "production"
                    ? process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
                    : process.env.NEXT_PUBLIC_MIXPANEL_TOKEN_DEV

                // no mixpanel token, opt out
                if (!mixpanelToken) {
                    mixpanel.opt_out_tracking()
                    mixpanel.reset()
                    return
                }

                // user has not consented to tracking, opt out
                if (userData.data.consentSettings !== true) {
                    mixpanel.opt_out_tracking()
                    mixpanel.reset()
                    return
                }

                // if the user has consented to data tracking, but we don't have the mixpanel 'opt-in' flag stored in localstoraga
                // set the user's 'opt-in' flag
                const optKey = `__mp_opt_in_out_${mixpanelToken}`
                if (
                    window.analyticsConsentedLocalStorage?.get(optKey) === null ||
                    window.analyticsConsentedLocalStorage?.get(optKey) === "0"
                ) {
                    mixpanel.opt_in_tracking()
                }

                // Alias any previously used anonymous id to the current session ID
                // This allows mixpanel to merge the user data
                // Alias should only be called once 
                const currentId = mixpanel.get_distinct_id()
                if (currentId !== session.user.id) {
                    mixpanel.alias(session.user.id, currentId)
                }

                // Identify and set user & org data for this session
                mixpanel.identify(session.user.id)
                mixpanel.people.set({
                    $email: session.user.email,
                    $name: session.user.name,
                })
                let currentOrg
                if (session.user.organizationId) {
                    currentOrg = await getOrganizationFromOrganizationId(
                        session.user.organizationId,
                        {
                            id: true,
                            name: true,
                            subdomain: true,
                        }
                    )
                }

                // add super properties that will apply to all tracked events
                mixpanel.register({
                    Environment: process.env.NEXT_PUBLIC_NODE_ENV,
                    ...(currentOrg?.success && currentOrg?.data
                    ? {
                        "Organization ID": currentOrg.data.id,
                        "Organization Name": currentOrg.data.name,
                        }
                    : undefined),
                })

                // Identify in Customer.io Web SDK with the same id
                if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
                    const cio = (window as any)._cio
                    if (cio) {
                        cio.identify(session.user.id, {
                            email: session.user.email,
                            name: session.user.name,
                            // optional: mirror org traits so web-events have them, too
                            ...(currentOrg?.success && currentOrg?.data
                                ? {
                                    organization_id: currentOrg.data.id,
                                    organization_name: currentOrg.data.name,
                                    }
                                : undefined),
                        })
                    }
                }

                setMixpanelContext({
                    distinctId: mixpanel.get_distinct_id(),
                })
            } catch (err) {
                console.error("Mixpanel identify failed:", err)
            }
        }

        // Only rerun when user identity actually changes
        if (
            JSON.stringify(prevSessionRef.current?.user) !==
            JSON.stringify(session.user)
        ) {
            runIdentify()
        }

        prevSessionRef.current = session
    }, [isMixpanelInitialized, session, status])

    // we can use Mixpanel's built in automatic page tracking instead of tracking manually
    // useEffect(() => {
    //     if (isMixpanelInitialized) {
    //         mixpanel.track(`User navigates to ${pathname}`)
    //     }
    // }, [isMixpanelInitialized, pathname])

    // Track Customer.io pageviews on route change
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') return;
        const cio = (window as any)._cio;
        if (!cio) return;
        // respect your existing consent gate — only send when analytics allowed
        if (getCookie('cookieyes-consent')?.includes('analytics:yes')) {
            cio.page(); // auto-includes url, title, referrer
        }
    }, [pathname]);

    return (
        <MixpanelContext.Provider value={({ mixpanelContext })}>
            {children}
        </MixpanelContext.Provider>
    )
}
