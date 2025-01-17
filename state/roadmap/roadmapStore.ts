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

export type RoadmapState = {
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string) => void
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void
    milestones: any[]
    setMilestone: (id: string, newProperties: any) => Promise<Milestone[] | void>
    setMilestones: (milestones: any[]) => Promise<Milestone[] | void>
    nodes: Node[]
    edges: Edge[]
    onEdgesChange: (changes: EdgeChange[]) => Promise<Edge[] | void>
    onConnect: (connection: any) => Promise<Edge[] | void>
    setNodes: (nodes: Node[]) => Promise<Node[] | void>
    setEdges: (edges: Edge[]) => Promise<Edge[] | void>
    addNodes: (node: Node[]) => Promise<Node[] | void>
    deleteNode: (nodeId: string) => Promise<any | void>
    initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => void
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
        initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => {
            const edgesWithMarker = edges.map(edge => ({
                ...edge,
                style: { stroke: 'black' }
            }))
            set({ nodes, edges: edgesWithMarker, milestones, selectedNodeId, roadmapId })
        },
        onboardingActive: true,
        setOnboardingActive: (active: boolean) => {
            set({ onboardingActive: active })
        },
        roadmapId: null,
        setRoadmapId: (id: string) => {
            set({ roadmapId: id })
        },
        selectedNodeId: null,
        setSelectedNodeId: (id: string | null) => {
            set({ selectedNodeId: id })
        },
        milestones: [],
        setMilestone: async (nodeId: string, newProperties: any) => {
            const milestones = get().milestones.map(milestone =>
                milestone.nodeId === nodeId
                    ? { ...milestone, ...newProperties }
                    : milestone
            )

            const response = await updateMilestones({ milestones })
            if (response.success && response.data) {
                // if task was created successfully, update zustand state
                set({ milestones: response.data as Milestone[] })

                toast.success("Milestone updated successfully!")
                return response.data as Milestone[]
            } else {
                console.error(`Error updating milestones`, response.error)
            }
        },
        setMilestones: async (milestones: any[]) => {
            // set({ milestones })
            // updateMilestones({ milestones })
            const response = await updateMilestones({ milestones })
            if (response.success && response.data) {
                // if task was created successfully, update zustand state
                set({ milestones: response.data as Milestone[] })

                toast.success("Milestone updated successfully!")
                return response.data as Milestone[]
            } else {
                console.error(`Error updating milestones`, response.error)
            }
        },
        nodes: [],
        edges: [],
        onEdgesChange: async (changes: EdgeChange[]) => {
            const edges = applyEdgeChanges(changes, get().edges)
            // set({ edges })

            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response.success && response.data) {
                set({ edges })
                return response.data as Edge[]
            } else {
                console.error(`Error updating Flow Edges`, response.error)
            }
        },
        onConnect: async (connection: any) => {
            const edges = addEdge(
                {
                    ...connection,
                    // markerEnd: {
                    //     type: MarkerType.ArrowClosed,
                    //     width: 20,
                    //     height: 20,
                    //     color: 'black'
                    // },
                    style: { stroke: 'black' }
                },
                get().edges
            )
            // set({ edges })

            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response.success && response.data) {
                set({ edges })
                return response.data as Edge[]
            } else {
                console.error(`Error updating Flow Edges`, response.error)
            }
        },
        setNodes: async (nodes: Node[]) => {
            const response = await updateDBFlow({ roadmapId: get().roadmapId, nodes, edges: get().edges })
            if (response.success && response.data) {
                const newNodes = response.data.nodes.map(n => ({
                    id: n.id,
                    type: n.type,
                    position: { x: n.positionX, y: n.positionY },
                    origin: n.origin
                })) as Node[]

                // special case here, we set the original nodes, so if nothing has changed zustand doesn't trigger a state change
                // this keeps us from having an infinite loop when handling the nodes local state in private-flow.tsx
                // local state is handled within the private-flow.tsx component, and debounced, because
                // the RaectFlow spams position updates and we don't want to save all of them to the Database..
                set({ nodes })
                return newNodes as Node[]
            } else {
                console.error(`Error updating database nodes`, response.error)
                toast.success("Error updating node state... your node may node's position may not have been saved")
            }
        },
        setEdges: async (edges: Edge[]) => {
            // set({ edges })
            const response = await updateEdges({ roadmapId: get().roadmapId, edges })
            if (response.success && response.data) {
                set({ edges })
                return response.data as Edge[]
            } else {
                console.error(`Error updating Flow Edges`, response.error)
            }
        },
        addNodes: async (nodes: Node[]) => {
            // set({ nodes: [...get().nodes, ...nodes], milestones: [...get().milestones, ...nodes.map(node => node.data)] })
            const newNodes = nodes

            const response = await createNodes({ roadmapId: get().roadmapId, nodes: newNodes })
            if (response.success && response.data && response.data.nodes && response.data.milestones) {
                const updatedNodes = [
                    ...get().nodes, 
                    ...response.data.nodes.map(n => ({
                        id: n.id,
                        type: n.type,
                        position: {
                            x: n.positionX,
                            y: n.positionY
                        },
                        origin: n.origin,
                        data: n.data
                    })) as Node[]
                ]
                const updatedMilestone = [
                    ...get().milestones,
                    ...response.data.milestones as Milestone[]
                ]
                set({ 
                    nodes: updatedNodes,
                    milestones: updatedMilestone
                })

                toast.success("Nodes added successfully!")
                return response.data.nodes
            } else {
                console.error(`Error adding nodes`, response.error)
            }
        },
        deleteNode: async (nodeId: string | undefined) => {
            const response = await deleteNode(nodeId)
            if (response.success && response.data) {
                const nodes = [...get().nodes].filter(({ id }) => id !== response.data.id)
                const milestones = get().milestones.filter(milestone =>
                    milestone.nodeId !== response.data.id
                )
                set({ nodes, milestones })

                return response.data
            } else {
                console.error(`Error deleting nodes`, response.error)
            }
        },
        saveState: () => {
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

