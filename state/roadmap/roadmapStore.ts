import { create } from "zustand"
import { temporal } from 'zundo'
import {
    addEdge,
    applyEdgeChanges,
    Edge,
    Node,
    EdgeChange
} from "@xyflow/react"
import { createNodes, deleteNode, Milestone, updateDBFlow, updateEdges, updateMilestones} from "@/lib/actions"
import { toast } from "sonner"
import { getRoadmap, getRoadmapId } from "@/lib/fetchers"

export type RoadmapState = {
    isUpdating: boolean,
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string) => void
    selectedView: string | null,
    setSelectedView: (view: string | null) => void,
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void
    milestones: any[]
    setMilestone: (id: string, newProperties: any) => Promise<Milestone[] | void>
    nodes: Node[]
    edges: Edge[]
    onEdgesChange: (changes: EdgeChange[]) => Promise<Edge[] | void>
    onConnect: (connection: any) => Promise<Edge[] | void>
    setNodes: (nodes: Node[]) => Promise<Node[] | void>
    setEdges: (edges: Edge[]) => Promise<Edge[] | void>
    addNodes: (node: Node[]) => Promise<Node[] | void>
    deleteNode: (nodeId: string) => Promise<any | void>
    initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedView: string | null, selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => void
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
        isUpdating: false,
        initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedView: string | null, selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => {
            console.log(`init roadmap state`)
            const edgesWithMarker = edges.map(edge => ({
                ...edge,
                style: { stroke: 'black' }
            }))
            set({ nodes, edges: edgesWithMarker, milestones, selectedView, selectedNodeId, roadmapId })
        },
        onboardingActive: true,
        setOnboardingActive: (active: boolean) => {
            console.log(`set onboarding active`)
            set({ onboardingActive: active })
        },
        roadmapId: null,
        setRoadmapId: (id: string) => {
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
        setMilestone: async (nodeId: string, newProperties: any) => {
            console.log(`set milestone`)
            const milestones = get().milestones.map(milestone =>
                milestone.nodeId === nodeId
                    ? { ...milestone, ...newProperties }
                    : milestone
            )
            if (newProperties.nodeType) {
                // if the type has been updated, we also update the node type
                const nodes = get().nodes.map(node => (
                    node.id === nodeId 
                        ? { ...node, type: newProperties.nodeType }
                        : node
                ))
                set({ milestones, nodes })
            } else {
                set({ milestones })
            }

            // update DB milestones
            const response = await updateMilestones({ milestones })
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
        onConnect: async (connection: any) => {
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
                    type: n.type,
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
        addNodes: async (nodes: Node[]) => {
            console.log(`add nodes`)
            set({ nodes: [...get().nodes, ...nodes], milestones: [...get().milestones, ...nodes.map(node => node.data)] })
            
            // update DB Nodes
            const response = await createNodes({ roadmapId: get().roadmapId, nodes })
            if (response?.success && response?.data && response.data.nodes && response.data.milestones) {
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
                return response.data
            } else {
                console.error(`Error deleting nodes`, response?.error)
                toast.error(`Error deleting milestone: ${response?.error}`)
            }
        },
        saveState: () => {
            console.log(`save state`)
            const state = get()
            set(state)
            updateDBFlow({ roadmapId: state.roadmapId, nodes: state.nodes, edges: state.edges })
            updateMilestones({ milestones: state.milestones })
        }
    }),
    {
        limit: 100, // limit the stored history states to 100
        onSave: (pastState, currentState) => {
            console.log(`Saved Roadmap State: `, currentState)
            return
        },
    })
)