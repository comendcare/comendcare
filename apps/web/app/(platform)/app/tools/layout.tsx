"use client"
import React, {useEffect, useState} from "react";
import {getAssets, getOrganizationFromOrganizationId, getToolTypes} from "@comend/lib/fetchers";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import { initializeAssetsStore} from "@comend/lib/initialize-client-state"
import NoOrganization from "~web/components/no-organization";
import Loading from "@/loading";import { ToolsNav } from "~web/components/tools-nav";

export default function ToolsLayout({children}: {children: React.ReactNode}) {
    const {data: session} = useSession()
    const [isInitialized, setIsInitialized] = useState(false)
    const [organization, setOrganization] = useState(undefined)

    const handleSessionUpdate = async () => {
        if (session && session?.user?.organizationId) {
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
                types: true,
                contacts: true,
                attachments: true,
                private: true,
                pinned: true,
                milestones: true
            })
            let toolTypesResponse = await getToolTypes({
                id: true,
                label: true,
                type: true,
                description: true,
                metadata: true
            })
            if (toolResponse.success && toolTypesResponse.success && toolTypesResponse.data) {
                initializeAssetsStore(toolResponse.data || [], toolTypesResponse.data)
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

    // if (!isInitialized) return <Loading />
    // if (!organization) return <NoOrganization />
    return (
        <div className="container relative flex flex-col items-center">
            <ToolsNav />
            {children}
        </div>
    )
}
