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
import { updateDBFlow, updateDBMilestones, updateDBTask } from "@/lib/actions"

export type RoadmapState = {
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string) => void
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void
    milestones: any[]
    setMilestone: (id: string, newProperties: any) => void
    setMilestones: (milestones: any[]) => void
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
        setMilestone: (nodeId: string, newProperties: any) => {
            const milestones = get().milestones.map(milestone =>
                milestone.nodeId === nodeId
                    ? { ...milestone, ...newProperties }
                    : milestone
            )
            set({ milestones })
            updateDBMilestones({ milestones: milestones.filter(milestone => milestone.nodeId === nodeId) })
        },
        setMilestones: (milestones: any[]) => {
            set({ milestones })
            updateDBMilestones({ milestones })
        },
        nodes: [],
        edges: [],
        onNodesChange: (changes: NodeChange[]) => {
            const nodes = applyNodeChanges(changes, get().nodes)
            const nodeIds = nodes.map(node => node.id)
            const milestones = get().milestones.filter(milestone =>
                nodeIds.includes(milestone.nodeId)
            )
            set({ nodes, milestones })
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
        addNodes: (nodes: Node[]) => {
            const newNodes = [...get().nodes, ...nodes]
            const milestones = [...get().milestones, ...nodes.map(node => node.data)]
            set({ nodes: newNodes, milestones })
            debounceUpdateFlow(get().roadmapId, newNodes, get().edges)
            // updateDBMilestones({ milestones: milestones })
        },
        deleteNode: (nodeId: string | undefined) => {
            const nodes = [...get().nodes].filter(({ id }) => id !== nodeId)
            const nodeIds = nodes.map(node => node.id)
            const milestones = get().milestones.filter(milestone =>
                nodeIds.includes(milestone.nodeId)
            )
            set({ nodes, milestones, selectedNodeId: null })
            debounceUpdateFlow(get().roadmapId, nodes, get().edges)
        },
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
        saveState: () => {
            const state = get()
            set(state)
            debounceUpdateFlow(state.roadmapId, state.nodes, state.edges)
            updateDBMilestones({ milestones: state.milestones })
        }
    }),
    {
        limit: 100, // limit the stored history states to 100
        // this handleSet should be where we're setting our debounce, but for some reason it grabs the previous state
        // not the current state
        // handleSet: (handleSet) => (
        //     debounce((state) => {
        //         console.log(`Saved State:`, state)
        //         handleSet(state)
        //         saveToDatabase(state.nodes, state.edges, state.milestones)
        //     }, 500)
        // ),
        onSave: (pastState, currentState) => {
            // console.log(`Saved Roadmap State: `, currentState)
            // debouncedSaveToDatabase(currentState.nodes, currentState.edges, currentState.milestones)
            return
        },
    })
)

// Wrap saveToDatabase in a debounce function - to avoid spamming the database
// export const debouncedSaveToDatabase = debounce(
//     (nodes: Node[], edges: Edge[], milestones: any[]) => {
//         saveToDatabase(nodes, edges, milestones)
//     },
//     500
// )

// debounce flow updates, because the flow spams X/Y Position change values when dragging a node
export const debounceUpdateFlow = debounce(
    (roadmapId: string | null, nodes: Node[], edges: Edge[]) => {
        updateDBFlow({ roadmapId, nodes, edges })
    }, 500
)

