import { create } from "zustand"
import { temporal } from 'zundo'
import {
    addEdge,
    applyEdgeChanges,
    Edge,
    Node,
    EdgeChange,
    Connection
} from "@xyflow/react"
import { createNodes, deleteNode, updateDBFlow, updateEdges, updateMilestones, updateRoadmap} from "@/lib/actions"
import { toast } from "sonner"
import { nanoid } from "nanoid"
import { Milestone, NodeType, StatusType } from "@/lib/types"
import { getMilestoneTypes } from "@/lib/fetchers"
import { MilestoneTypeOnMilestone, Roadmap } from "@prisma/client"
import mixpanel from "mixpanel-browser"
import { mixpanelTrack } from "@/app/mixpanel"

export type ResearchPlanDetails = {
    title: string,
    description: string | undefined
}

export type RoadmapState = {
    initialized: boolean,
    initState: (
        details: ResearchPlanDetails, 
        nodes: Node[], 
        edges: Edge[], 
        milestones: Milestone[], 
        selectedView: string | null, 
        selectedNodeId: string | null, 
        selectedTaskId: string | null, 
        roadmapId: string
    ) => void,
    details: ResearchPlanDetails,
    setDetails: (details: ResearchPlanDetails) => Promise<void>
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string | null) => void
    selectedView: string | null,
    setSelectedView: (view: string | null) => void,
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void
    milestones: Milestone[]
    setMilestone: (id: string, newProperties: Partial<Milestone>) => Promise<Milestone[] | void>
    setMilestones: (milestones: Milestone[]) => Promise<Milestone[] | void>
    nodes: Node[]
    edges: Edge[]
    onEdgesChange: (changes: EdgeChange[]) => Promise<Edge[] | void>
    onConnect: (connection: Connection) => Promise<Edge[] | void>
    setNodes: (nodes: Node[]) => Promise<Node[] | void>
    setEdges: (edges: Edge[]) => Promise<Edge[] | void>
    addMilestones: (milestones: Partial<Milestone>[], creationMethod?: string) => Promise<Node[] | void>
    addNodes: (node: Node[], creationMethod?: string) => Promise<Node[] | void>
    deleteNode: (nodeId: string) => Promise<void>
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
        initialized: false,
        initState: (details: ResearchPlanDetails, nodes: Node[], edges: Edge[], milestones: Milestone[], selectedView: string | null, selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => {
            console.log(`init roadmap state`)
            const edgesWithMarker = edges.map(edge => ({
                ...edge,
                style: { stroke: 'black' }
            }))
            set({ details: details, initialized: true, nodes, edges: edgesWithMarker, milestones, selectedView, selectedNodeId, roadmapId })
        },
        details: {
            title: '',
            description: ''
        },
        setDetails: async (details: ResearchPlanDetails) => {
            // update research plan details here...
            // if (id !== get().roadmapId) {
            //     console.error(`Error: Given resarch plan ID does not match the active research plan. Could not update research plan.`)
            //     return
            // }
            const id = get().roadmapId

            if (!id) {
                console.error(`Error: no active research plan!`)
                return
            }

            const roadmap = await updateRoadmap({
                id,
                title: details.title,
                description: details.description || null
            })

            if (roadmap) {
                set({ details })
            }
        },
        onboardingActive: true,
        setOnboardingActive: (active: boolean) => {
            console.log(`set onboarding active`)
            set({ onboardingActive: active })
        },
        roadmapId: null,
        setRoadmapId: (id: string | null) => {
            console.log(`set roadmap id`)
            set({ roadmapId: id })
        },
        selectedView: null,
        setSelectedView: (view: string | null) => {
            // setting the selected roadmap view has an effect on the URL
            // if the url is updated more than once while the DB call is still occurring next.js treats
            // this as a full page reload, causing the loading state to show
            // to avoid this we don't update the roadmap view if the database is currently updating
            // NOTE: url is updated in roadmap.tsx
            console.log(`set selected roadmap view`)
            set({ selectedView: view })
        },
        selectedNodeId: null,
        setSelectedNodeId: (id: string | null) => {
            // setting the selected node id has an effect on the URL
            // if the url is updated more than once while the DB call is still occurring next.js treats
            // this as a full page reload, causing the loading state to show
            // to avoid this we don't update the node id if the database is currently updating
            // NOTE: url is updated in roadmap.tsx
            console.log(`set selected node id`)
            set({ selectedNodeId: id })
        },
        milestones: [],
        setMilestone: async (nodeId: string | null, newProperties: Partial<Milestone>) => {
            console.log(`set milestone`)
            const milestones = get().milestones.map(milestone =>
                milestone.nodeId === nodeId
                    ? { ...milestone, ...newProperties }
                    : milestone
            )
            set({ milestones })

            // update DB milestones
            const response = await updateMilestones({ milestones })
            if (response?.success && response?.data) {
                return response.data as Milestone[]
            } else {
                toast.error("Could not update milestones", {position: "bottom-left"})
                console.error(`Error updating milestones`, response?.error)
            }
        },
        setMilestones: async (milestones: Milestone[]) => {
            console.log(`set milestones`)
            const updatedMilestones = get().milestones.map(oldMilestone => {
                const newMilestone = milestones.find(m => m.id === oldMilestone.id)
                if (newMilestone) {
                    return ({
                        ...oldMilestone,
                        ...newMilestone
                    })
                } else {
                    return oldMilestone
                }
            })
            set({ milestones: updatedMilestones })

            // update DB milestones
            const response = await updateMilestones({ milestones: updatedMilestones })
            if (response?.success && response?.data) {
                return response.data as Milestone[]
            } else {
                toast.error("Could not update milestones", {position: "bottom-left"})
                console.error(`Error updating milestones`, response?.error)
            }
        },
        nodes: [],
        edges: [],
        onEdgesChange: async (changes: EdgeChange[]) => {
            console.log(`on edges change`)
            const edges = applyEdgeChanges(changes, get().edges)
            set({ edges })

            // update DB edges
            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response?.success && response?.data) {
                return response.data as Edge[]
            } else {
                toast.error("Could not update edges", {position: "bottom-left"})
                console.error(`Error updating Flow Edges`, response?.error)
            }
        },
        onConnect: async (connection: Connection) => {
            console.log(`on connect`)
            const edges = addEdge(
                {...connection, style: { stroke: 'black' }},
                get().edges
            )
            set({ edges })

            // update DB edges
            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response?.success && response?.data) {
                return response.data as Edge[]
            } else {
                toast.error("Could not update edges", {position: "bottom-left"})
                console.error(`Error updating Flow Edges`, response?.error)
            }
        },
        setNodes: async (nodes: Node[]) => {
            console.log(`set nodes`)
            set({ nodes })

            const response = await updateDBFlow({ roadmapId: get().roadmapId, nodes, edges: get().edges })
            if (response?.success && response?.data) {
                const newNodes = response.data.nodes.map(n => ({
                    id: n.id,
                    position: { x: n.positionX, y: n.positionY },
                    origin: n.origin
                })) as Node[]

                return newNodes as Node[]
            } else {
                console.error(`Error updating database nodes`, response?.error)
                toast.success("Error updating node state... your node may node's position may not have been saved")
            }
        },
        setEdges: async (edges: Edge[]) => {
            console.log(`set edges`)
            set({ edges })

            // update DB edges
            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response?.success && response?.data) {
                return response.data as Edge[]
            } else {
                console.error(`Error updating Flow Edges`, response?.error)
            }
        },
        addMilestones: async (milestones: Partial<Milestone>[], creationMethod?: string) => {
            console.log(`add milestones`, milestones)
            const newNodes: Node[] = []
    
            // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
            // const {
            //     height,
            //     width,
            //     transform: [transformX, transformY, zoomLevel]
            // } = store.getState()
    
            // const zoomMultiplier = 1 / zoomLevel
            // let centerX =
            //     -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
            // let centerY =
            //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2

            const milestoneTypes = await getMilestoneTypes()
    
            const milestonesAlongXAxis = get().nodes.sort((a, b) => {
                return a.position.x - b.position.x
            })
            let centerX = milestonesAlongXAxis.length > 0 ? ((milestonesAlongXAxis[milestonesAlongXAxis.length - 1]?.position?.x || 0) + 500): (0)
            let centerY = 0
    
            milestones.forEach((defaultData, index) => {
                const id = nanoid()
                const milestoneId = nanoid()
                const newNode: Node = {
                    id: id,
                    type: defaultData?.nodeType || "PROJECT",
                    position: {
                        x: centerX,
                        y: centerY
                    },
                    origin: [0.0, 0.0],
                    data: {
                        id: milestoneId,
                        nodeId: id,
                        private: true,
                        timelineOrder: get().milestones.length + index, // add in last position in timeline
                        nodeType: defaultData?.nodeType || "PROJECT",
                        title: defaultData?.title || 'New Milestone',
                        description: defaultData?.description || '',
                        types: defaultData?.types,
                        status: defaultData?.status || "PLANNED",
                    }
                }
    
                centerX += 500
                // centerY += 200
    
                newNodes.push(newNode)
            })
    
            const nodes = await get().addNodes(newNodes, creationMethod)
            return nodes
        },
        addNodes: async (nodes: Node[], creationMethod?: string) => {
            console.log(`add nodes`)
            set({ 
                nodes: [...get().nodes, ...nodes], 
                milestones: [...get().milestones, ...nodes.map(node => node.data as Milestone)] 
            })
            
            // update DB Nodes
            const response = await createNodes({ roadmapId: get().roadmapId, nodes })
            if (response?.success && response?.data && response.data.nodes && response.data.milestones) {
                response.data.milestones.forEach(milestone => {
                    mixpanelTrack("Project Created", {
                        "Creation Method": creationMethod,
                        "Title": milestone.title,
                        "Types": milestone.types.map((type: any) => type.milestoneType.label || type.miletoneType.id)
                    })
                })
                return response.data.nodes
            } else {
                console.error(`Error adding nodes`, response?.error)
                toast.error(`Error adding milestones: ${response?.error}`)
            }
        },
        deleteNode: async (nodeId: string | undefined) => {
            console.log(`delete nodes`)
            const nodes = [...get().nodes].filter(({ id }) => id !== nodeId)
            const milestones = get().milestones.filter(milestone =>
                milestone.nodeId !== nodeId
            )
            set({ nodes, milestones, selectedNodeId: null })

            // update DB nodes
            const response = await deleteNode(nodeId)
            if (response?.success && response?.data) {
                // don't return anything
            } else {
                console.error(`Error deleting nodes`, response?.error)
                toast.error(`Error deleting milestone: ${response?.error}`)
            }
        },
        saveState: () => {
            console.log(`save state`)
            const state = get()
            updateDBFlow({ roadmapId: state.roadmapId, nodes: state.nodes, edges: state.edges })
            updateMilestones({ milestones: state.milestones })
        }
    }),
    {
        limit: 100, // limit the stored history states to 100
        onSave: (pastState, currentState) => {
            console.log(`Past state`, pastState)
            console.log(`Saved Roadmap State: `, currentState)
            return
        },
        partialize: (state) => {
            const { selectedNodeId, nodes, edges, milestones, ...rest } = state;
            return { selectedNodeId, nodes, edges, milestones };
        },
    })
)