"use client"
import React, {useEffect, useState} from "react";
import {getOrganizationFromOrganizationId, getRFPs} from "@/lib/fetchers";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {initializeRFPStore} from "@/lib/initialize-client-state"
import Loading from "@/app/loading";
import NoOrganization from "@/components/no-organization";

export default function RFPsLayout({children}: {children: React.ReactNode}) {
    const {data: session} = useSession()
    const [isInitialized, setIsInitialized] = useState(false)
    const [organization, setOrganization] = useState(undefined)

    const handleSessionUpdate = async () => {
        if (session && session.user.organizationId) {
            // init organization
            const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {id: true})
            if (response.success) {
                setOrganization(response.data)
            } else {
                console.error(response.error)
            }

            // init rfp store
            let rfpResponse = await getRFPs(session.user.organizationId, {
                id: true,
                title: true,
                description: true,
                openTo: true,
                startDate: true,
                endDate: true,
                contacts: true,
                attachments: true,
                budget: true,
                private: true,
                headerImage: true,
                pinned: true,
                milestones: true,
                organizationId: true,
            })
            if (rfpResponse.success) {
                initializeRFPStore(rfpResponse.data || [])
                console.log(`RFPs initialized...`)
            } else {
                console.error(rfpResponse.error)
                toast.error(rfpResponse.error)
            }

            setIsInitialized(true)
        }
    }

    useEffect(() => {
        handleSessionUpdate()
    }, [session?.user?.organizationId])

    if (!isInitialized) return <Loading />
    if (!organization) return <NoOrganization />
    return <>{children}</>
}