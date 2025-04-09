"use client"

import React, { useEffect, useState } from "react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PAGSettingsMembersTab from "@/components/pag-settings-members-tab"
import PAGSettingsInvitationsTab from "@/components/pag-settings-invitations-tab"
import PAGSettingsRequestsTab from "@/components/pag-settings-requests-tab"
import OrganizationSettingsPage from "@/components/organization-settings-page"
import { Organization } from "@prisma/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function OrganizationSettingsTabs({
                                                     organization,
                                                 }: {
    organization: Organization
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedTab, setSelectedTab] = useState("general")

    useEffect(() => {
        const tabFromUrl = searchParams.get("tab") || "general"
        setSelectedTab(tabFromUrl)
    }, [searchParams])

    const handleTabChange = (value: string) => {
        setSelectedTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <main className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
            <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4 w-full">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="invitations">Invitations</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4 w-full">
                    <OrganizationSettingsPage organization={organization} />
                </TabsContent>
                <TabsContent value="members" className="space-y-4 w-full">
                    <PAGSettingsMembersTab />
                </TabsContent>
                <TabsContent value="invitations" className="space-y-4 w-full">
                    <PAGSettingsInvitationsTab />
                </TabsContent>
                <TabsContent value="requests" className="space-y-4 w-full">
                    <PAGSettingsRequestsTab />
                </TabsContent>
            </Tabs>
        </main>
    )
}
