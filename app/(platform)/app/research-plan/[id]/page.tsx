import {getNodesEdgesAndMilestones, getOrganizationFromOrganizationId, getRoadmap} from "@/lib/fetchers"
import {getSession} from "@/lib/auth"
import {Roadmap} from "@/components/roadmap"
import NoOrganization from "@/components/no-organization";
// import { useSearchParams } from "next/navigation";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { toast } from "sonner";
import ResearchPlanInitWrapper from "./layout";
// import { useSession } from "next-auth/react";

export default async function RoadmapPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    // const {data: session} = useSession()
    const orgId = session?.user.organizationId
    // const searchParams = useSearchParams()

    const response = await getRoadmap(session?.user.organizationId, params.id)
    // cm9vkmnet0000xhlmpv1grm41
    // if (response.success && response.data) {
    //     // initialize roadmap zustand here...
    //     // init roadmap/research plan store
    //     // let response = await getRoadmapId(session.user.organizationId)
    //     if (response.success) {
    //         // if we're on the research plan page and the resarch plan doesn't exist, create it, then initialize
    //         // if (pathname === "/app/research-plan" && !response.data) {
    //         //     console.log(`research plan doesn't exist, create it`)
    //         //     const roadmap =  await createRoadmap(session.user.organizationId, {})
    //         //     console.log(`roadmap`, roadmap)
    //         //     response = await getRoadmapId(session.user.organizationId)
    //         // }
    
    //         const nodesResponse = await getNodesEdgesAndMilestones(params.id)
    //         // const urlNode = searchParams.get("milestone")
    //         // const urlView = searchParams.get("view")
    //         if (nodesResponse.success) {
    //             initializeRoadmapState({
    //                 roadmapId: params.id,
    //                 nodes: nodesResponse.data.nodes,
    //                 edges: nodesResponse.data.edges,
    //                 milestones: nodesResponse.data.milestones,
    //                 selectedView: null,
    //                 selectedNodeId: null
    //                 // selectedView: urlView,
    //                 // selectedNodeId: urlNode 
    //             })
    //         } else {
    //             // init state, but research plan has not been created yet
    //             initializeRoadmapState({
    //                 roadmapId: null,
    //                 nodes: [],
    //                 edges: [],
    //                 milestones: [],
    //                 selectedView: null,
    //                 selectedNodeId: null 
    //             })
    //         }
    //         console.log(`Research Plan initialized...`)
    //     } else {
    //         console.error(response.error)
    //         toast.error(response.error)
    //     }
    // } else {
    //     console.error(`Could not initialize active roadmap with id ${params.id}`)
    // }

    if (!orgId) {
        return <NoOrganization />
    }

    return (
        <Roadmap />
    )
}