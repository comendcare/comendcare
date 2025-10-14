import { getSession } from "@/packages/lib/auth"
import { Roadmap } from "~web/components/roadmap"
import NoOrganization from "~web/components/no-organization"
import {
    getBiosamples, 
    getDatasamples, 
    getDiseaseModels, 
    getMilestoneTypes, 
    getOrganizationFromOrganizationId, 
    getRFPs, 
    getRoadmap, 
    getRoadmapEdges, 
    getRoadmapMilestones, 
    getRoadmapNodes
} from "@/packages/lib/fetchers"

export default async function RoadmapPage({
                                              params,
                                              searchParams,
                                          }: {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    if (!orgId) return <NoOrganization />

    const [
        milestoneTypesSettle,
        organizationSettle,
        roadmapSettle,
        milestonesSettle,
        nodesSettle,
        edgesSettle,
        biosamplesSettle,
        diseaseModelsSettle,
        clinicalDatasetsSettle,
        rfpSettle,
    ] = await Promise.allSettled([
        getMilestoneTypes({
            id: true,
            label: true,
        }),
        getOrganizationFromOrganizationId(orgId, {
            id: true,
            name: true,
            subdomain: true,
            published: true,
        }),
        getRoadmap(orgId, params.id, {
            id: true,
            title: true,
            description: true,
            content: true,
            slug: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            published: true,
            organizationId: true,
            organization: true,
            user: true,
            modalities: true,
            metadata: true,
        }),
        getRoadmapMilestones(orgId, params.id, {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            description: true,
            notes: true,
            status: true,
            budget: true,
            endDate: true,
            startDate: true,
            private: true,
            otherTypeDetails: true,
            timelineOrder: true,
            nodeType: true,
            roadmapId: true,
            organizationId: true,
            nodeId: true,
            metadata: true,
            node: true,
            contacts: true,
            attachments: true,
            types: { include: { milestoneType: true } },
            tools: { include: { tool: true } },
            rfps: { include: { rfp: true } },
        }),
        getRoadmapNodes(orgId, params.id, {
            id: true,
            createdAt: true,
            updatedAt: true,
            positionX: true,
            positionY: true,
            origin: true,
            roadmapId: true,
        }),
        getRoadmapEdges(orgId, params.id, {
            id: true,
            source: true,
            target: true,
            type: true,
            data: true,
            roadmapId: true,
        }),
        getBiosamples(orgId, { id: true }),
        getDiseaseModels(orgId, { id: true }),
        getDatasamples(orgId, { id: true }),
        getRFPs(orgId, {id: true, title: true})
    ])

    // Helper to unwrap settled results safely
    const ok = <T,>(s: PromiseSettledResult<T>): T | undefined =>
        s.status === "fulfilled" ? s.value : undefined

    const milestoneTypesRes = ok(milestoneTypesSettle)
    const organizationRes = ok(organizationSettle)
    const roadmapRes = ok(roadmapSettle)
    const milestonesRes = ok(milestonesSettle)
    const nodesRes = ok(nodesSettle)
    const edgesRes = ok(edgesSettle)

    if (!roadmapRes?.success || !roadmapRes.data) {
        return <NoOrganization />
    }

    const milestoneTypes = milestoneTypesRes?.success
        ? milestoneTypesRes.data ?? []
        : []

    const organization = organizationRes?.success ? organizationRes.data : undefined

    const initMilestones = milestonesRes?.success ? milestonesRes.data : []
    const initNodes = nodesRes?.success ? nodesRes.data : []
    const initEdges = edgesRes?.success ? edgesRes.data : []

    const urlNode = searchParams.project
    const urlView = searchParams.view

    return (
        <Roadmap
            milestoneTypes={milestoneTypes}
            organization={organization}
            orgSubdomain={organization?.subdomain}
            orgIsPublished={!!organization?.published}
            researchPlanId={params.id}
            initRoadmap={roadmapRes.data}
            initEdges={initEdges}
            initNodes={initNodes}
            initMilestones={initMilestones}
            biosampleOptions={biosamplesSettle.data}
            diseaseModelOptions={diseaseModelsSettle.data}
            clinicalDatasetOptions={clinicalDatasetsSettle.data}
            rfpOptions={rfpSettle.data}
            urlNode={urlNode}
            urlView={urlView}
        />
    )
}
