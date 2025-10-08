import {getSession} from "@/packages/lib/auth"
import {Roadmap} from "~web/components/roadmap"
import NoOrganization from "~web/components/no-organization";
import {getMilestoneTypes, getOrganizationFromOrganizationId, getRoadmap, getRoadmapEdges, getRoadmapMilestones, getRoadmapNodes} from "@/packages/lib/fetchers";
import { initializeRoadmapState } from "@/packages/lib/initialize-client-state";

export default async function RoadmapPage({params}: { params: { id: string } }) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization/>

    const [milestoneTypesRes, organizationRes] = await Promise.all([
        getMilestoneTypes({
            id: true,
            label: true,
            services: true,
            categories: true,
            description: true,
        }),
        getOrganizationFromOrganizationId(orgId, {
            id: true,
            // public: true,
            // verified: true,
            // published: true,
            name: true,
            // description: true,
            // contactEmail: true,
            // logo: true,
            // image: true,
            // headerImage: true,
            // biopharmaConsentSettings: true,
            subdomain: true,
            // customDomain: true,
            // statedGoal: true,
            // yearFounded: true,
            // incorporationStatus: true,
            // therapeuticsOfInterest: true,
            // therapeuticsInDevelopment: true,
            // website: true,
            // moneyRaised: true,
            // moneyDeployed: true,
            // researchBudget: true,
            // createdAt: true,
            // updatedAt: true,
            // user: true,
            // userId: true,
            // roadmaps: true,
            // members: true,
            // clients: true,
            // invitations: true,
            // membershipRequests: true,
            // conditions: true,
            // kanban: true,
            // milestones: true,
            // platformNotifications: true,
            // reviews: true,
            // savedCompanies: true,
            // tools: true,
            // rfps: true,
            // metadata: true
        }),
    ]);

    console.log(`Start Research Plan Init: Fetch Data`)
    const response = await getRoadmap(orgId, params.id, {
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
        // edges: true,
        // milestones: true,
        // nodes: true,
        modalities: true,
        metadata: true,
    })
    console.log(`Fetched roadmap data`)
    const milestonesResponse = await getRoadmapMilestones(orgId, params.id, {
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
        types: {include: {milestoneType: true}},
        tools: {include: {tool: true}},
        rfps: {include: {rfp: true}}
    })
    console.log(`Fetched project data`)
    const nodesResponse = await getRoadmapNodes(orgId, params.id, {
        id: true,
        createdAt: true,
        updatedAt: true,
        positionX: true,
        positionY: true,
        origin: true,
        roadmapId: true,
    })
    console.log(`Fetched node data`)
    const edgesResponse = await getRoadmapEdges(orgId, params.id, {
        id: true,
        source: true,
        target: true,
        type: true,
        data: true,
        roadmapId: true
    })
    console.log(`Fetched edges data`)
    
    if (response.success && response.data && milestonesResponse.success && nodesResponse.success && edgesResponse.success) {
        // const urlNode = new URLSearchParams(searchParamsString).get("milestone")
        // const urlView = new URLSearchParams(searchParamsString).get("view")

        console.log(`Start zustand initialization`)

        // initializeRoadmapState({
        //     roadmapId: params.id,
        //     details: response.data,
        //     nodes: nodesResponse.data || [],
        //     edges: edgesResponse.data || [],
        //     milestones: milestonesResponse.data || [],
        //     selectedView: undefined,
        //     selectedNodeIds: []
        //     // selectedView: urlView,
        //     // selectedNodeIds: urlNode ? [urlNode] : [],
        // })

        console.log(`Zustand initialized successfully`)
        // optional: toast.success("Research Plan loaded")
    } else {
        console.error(`Could not initialize active roadmap with id ${params.id}. Error: ${response.error}`)
        // toast.error(`Could not initialize active roadmap with id ${params.id}. Error: ${response.error}`)
    }

    const milestoneTypes = milestoneTypesRes.success ? (milestoneTypesRes.data ?? []) : [];
    const organization = organizationRes.success ? organizationRes.data : undefined;

    return (
        <Roadmap
            milestoneTypes={milestoneTypes}
            organization={organization}
            orgSubdomain={organization?.subdomain}
            orgIsPublished={!!organization?.published}
            researchPlanId={params.id}
            initRoadmap={response.data}
            initEdges={edgesResponse.data}
            initNodes={nodesResponse.data}
            initMilestones={milestonesResponse.data}
        />
    )
}
