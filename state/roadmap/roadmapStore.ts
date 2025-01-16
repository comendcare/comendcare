import { create } from "zustand"
import { temporal } from 'zundo'
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Edge,
    MarkerType,
    Node,
    NodeChange,
    EdgeChange
} from "@xyflow/react"
import { debounce } from "lodash"
import { createNodes, deleteNode, Milestone, updateDBFlow, updateMilestones} from "@/lib/actions"
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
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void
    onConnect: (connection: any) => void
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    addNodes: (node: Node[]) => void
    deleteNode: (nodeId: string) => void
    initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => void
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
        initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => {
            const edgesWithMarker = edges.map(edge => ({
                ...edge,
                // markerEnd: {
                //     type: MarkerType.ArrowClosed,
                //     width: 20,
                //     height: 20,
                //     color: 'black'
                // },
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
        onNodesChange: async (changes: NodeChange[]) => {
            const nodes = applyNodeChanges(changes, get().nodes)
            set({ nodes })
            debounceUpdateFlow(get().roadmapId, nodes, get().edges)
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            const edges = applyEdgeChanges(changes, get().edges)
            set({ edges })
            debounceUpdateFlow(get().roadmapId, get().nodes, edges)
        },
        onConnect: (connection: any) => {
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
            set({ edges })
            debounceUpdateFlow(get().roadmapId, get().nodes, edges)
        },
        setNodes: (nodes: Node[]) => {
            set({ nodes })
            debounceUpdateFlow(get().roadmapId, nodes, get().edges)
        },
        setEdges: (edges: Edge[]) => {
            set({ edges })
            debounceUpdateFlow(get().roadmapId, get().nodes, edges)
        },
        addNodes: async (nodes: Node[]) => {
            const newNodes = [...get().nodes, ...nodes]

            const response = await createNodes({ roadmapId: get().roadmapId, nodes: newNodes })
            if (response.success && response.data && response.data.nodes && response.data.milestones) {
                set({ 
                    nodes: response.data.nodes.map(n => ({
                        id: n.id,
                        type: n.type,
                        position: {
                            x: n.positionX,
                            y: n.positionY
                        },
                        data: n.data
                    })) as Node[], 
                    milestones: response.data.milestones as Milestone[] 
                })

                toast.success("Nodes added successfully!")
                return response.data
            } else {
                console.error(`Error adding nodes`, response.error)
            }
        },
        deleteNode: async (nodeId: string | undefined) => {
            const response = await deleteNode(nodeId)
            if (response.success && response.data) {
                // if task was created successfully, update zustand state
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
            debounceUpdateFlow(state.roadmapId, state.nodes, state.edges)
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

// debounce flow updates, because the flow spams X/Y Position change values when dragging a node
export const debounceUpdateFlow = debounce(
    (roadmapId: string | null, nodes: Node[], edges: Edge[]) => {
        updateDBFlow({ roadmapId, nodes, edges })
    }, 500
)

