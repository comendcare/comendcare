"use client"

import {getOrganizationFromOrganizationId, getRoadmap} from "@/lib/fetchers"
import {Roadmap} from "@/components/roadmap"
import NoOrganization from "@/components/no-organization";
import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {getPublicFile} from "@/lib/utils";

export default function RoadmapPage() {
    const {data: session} = useSession()
    const orgId = session?.user.organizationId;
    const [roadmap, setRoadmap] = useState({})

    useEffect(() => {
        async function fetchOrganizationData() {
            if (session?.user?.organizationId) {
                let roadmapData
                let response = await getRoadmap(orgId)
                if (response.success) {
                    roadmapData = response.data
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }

                if (roadmapData) {
                    setRoadmap(roadmapData);
                }
            }
        }

        fetchOrganizationData();
    }, [session]);

    if (!orgId) {
        return <NoOrganization />
    }

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto">
            <Roadmap data={roadmap} />
        </main>
    )
}
