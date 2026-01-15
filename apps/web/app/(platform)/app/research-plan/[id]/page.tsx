import { getSession } from "@comend/lib/auth"
import dynamic from "next/dynamic"
import NoOrganization from "~web/components/no-organization"
import {
    getBiosamples,
    getClinicalDatasets,
    getDiseaseModels,
    getMilestoneTypes,
    getOrganizationFromOrganizationId,
    getRFPs,
    getRoadmap,
    getRoadmapEdges,
    getRoadmapMilestones,
    getRoadmapNodes
} from "@comend/lib/fetchers"
import FlowViewSkeleton from "../loading"

const Roadmap = dynamic(() => import("~web/components/roadmap").then(mod => ({ default: mod.Roadmap })), {
    loading: () => <FlowViewSkeleton />,
    ssr: true
})

export const revalidate = 30; // Revalidate every 30 seconds

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

    // Group fetches: core roadmap data first, then options in parallel
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
            biosamples: { include: { biosample: true} },
            diseaseModels: { include: { diseaseModel: true } },
            tools: { include: { tool: true } },
            rfps: { include: { rfp: true } },
            companies: {include: {company: true}},
            institutions: {include: {institution: true}},
            createFacilityRequests: true
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
        getBiosamples(orgId, { id: true, types: true }),
        getDiseaseModels(orgId, { id: true, types: true }),
        getClinicalDatasets(orgId, { id: true, types: true, title: true }),
        getRFPs(orgId, {id: true, title: true})
    ])

    // Helper to unwrap settled results safely
    const ok = <T,>(s: PromiseSettledResult<T>): T | undefined =>
        s.status === "fulfilled" ? s.value : undefined

    const milestoneTypesRes = ok(milestoneTypesSettle)
    const biosamplesRes = ok(biosamplesSettle)
    const diseaseModelsRes = ok(diseaseModelsSettle)
    const clinicalDatasetsRes = ok(clinicalDatasetsSettle)
    const rfpRes = ok(rfpSettle)
    const organizationRes = ok(organizationSettle)
    const roadmapRes = ok(roadmapSettle)
    const milestonesRes = ok(milestonesSettle)
    const nodesRes = ok(nodesSettle)
    const edgesRes = ok(edgesSettle)

    if (!roadmapRes?.success || !roadmapRes.data) {
        return <NoOrganization />
    }

    const milestoneTypes = milestoneTypesRes?.success ? milestoneTypesRes.data ?? [] : []
    const biosampleOptions = biosamplesRes?.data ? biosamplesRes.data ?? [] : []
    const diseaseModelOptions = diseaseModelsRes?.data ? diseaseModelsRes.data ?? [] : []
    const clinicalDatasetOptions = clinicalDatasetsRes?.data ? clinicalDatasetsRes.data ?? [] : []
    const rfpOptions = rfpRes?.success ? rfpRes.data ?? [] : []

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
            biosampleOptions={biosampleOptions}
            diseaseModelOptions={diseaseModelOptions}
            clinicalDatasetOptions={clinicalDatasetOptions}
            rfpOptions={rfpOptions}
            urlNode={urlNode}
            urlView={urlView}
        />
    )
}
