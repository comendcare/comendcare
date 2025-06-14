"use client"
import React, {useEffect, useState} from "react";
import {getAssets, getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import { initializeAssetsStore} from "@/lib/initialize-client-state"
import NoOrganization from "@/components/no-organization";
import Loading from "@/loading";;

export default function ToolsLayout({children}: {children: React.ReactNode}) {
    const {data: session} = useSession()
    const [isInitialized, setIsInitialized] = useState(false)
    const [organization, setOrganization] = useState(undefined)

    const handleSessionUpdate = async () => {
        if (session) {
            // init organization
            const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {id: true})
            if (response.success) {
                setOrganization(response.data)
            } else {
                console.error(response.error)
            }

            // init tool store
            let toolResponse = await getAssets(session?.user.organizationId, {
                id: true,
                title: true,
                description: true,
                contacts: true,
                attachments: true,
                private: true,
                pinned: true,
                milestones: true
            })
            if (toolResponse.success) {
                initializeAssetsStore(toolResponse.data || [])
                console.log(`Tools initialized...`)
            } else {
                console.error(toolResponse.error)
                toast.error(toolResponse.error)
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
