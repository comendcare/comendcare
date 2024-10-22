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

export type RoadmapState = {
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
    addNode: (node: Node) => void
}
export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
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
            debouncedSaveToDatabase(get().nodes, get().edges, milestones)
        },
        setMilestones: (milestones: any[]) => {
            set({ milestones })
        },
        nodes: [],
        edges: [],
        onNodesChange: (changes: NodeChange[]) => {
            const nodes = applyNodeChanges(changes, get().nodes)
            const nodeIds = nodes.map(node => node.id)
            const milestones = get().milestones.filter(milestone =>
                nodeIds.includes(milestone.nodeId)
            )
            set({ nodes })
            set({ milestones })
            debouncedSaveToDatabase(nodes, get().edges, milestones)
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            const edges = applyEdgeChanges(changes, get().edges)
            set({ edges })
            debouncedSaveToDatabase(get().nodes, edges, get().milestones)
        },
        onConnect: (connection: any) => {
            const edges = addEdge(
                {
                    ...connection,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20
                    }
                },
                get().edges
            )
            set({ edges })
            debouncedSaveToDatabase(get().nodes, edges, get().milestones)
        },
        setNodes: (nodes: Node[]) => {
            set({ nodes })
            debouncedSaveToDatabase(nodes, get().edges, get().milestones)
        },
        setEdges: (edges: Edge[]) => {
            set({ edges })
            debouncedSaveToDatabase(get().nodes, edges, get().milestones)
        },
        addNode: (node: Node) => {
            const nodes = [...get().nodes, node]
            const milestones = [...get().milestones, node.data]
            set({ nodes })
            set({ milestones })
            debouncedSaveToDatabase(nodes, get().edges, milestones)
        }
    }))
)
// export const useRoadmapStore = create<RoadmapState>((set, get) => ({
//     selectedNodeId: null,
//     setSelectedNodeId: (id: string | null) => {
//         set({ selectedNodeId: id })
//     },
//     milestones: [],
//     setMilestone: (nodeId: string, newProperties: any) => {
//         const milestones = get().milestones.map(milestone =>
//             milestone.nodeId === nodeId
//                 ? { ...milestone, ...newProperties }
//                 : milestone
//         )
//         set({ milestones })
//         debouncedSaveToDatabase(get().nodes, get().edges, milestones)
//     },
//     setMilestones: (milestones: any[]) => {
//         set({ milestones })
//     },
//     nodes: [],
//     edges: [],
//     onNodesChange: (changes: NodeChange[]) => {
//         const nodes = applyNodeChanges(changes, get().nodes)
//         const nodeIds = nodes.map(node => node.id)
//         const milestones = get().milestones.filter(milestone =>
//             nodeIds.includes(milestone.nodeId)
//         )
//         set({ nodes })
//         set({ milestones })
//         debouncedSaveToDatabase(nodes, get().edges, milestones)
//     },
//     onEdgesChange: (changes: EdgeChange[]) => {
//         const edges = applyEdgeChanges(changes, get().edges)
//         set({ edges })
//         debouncedSaveToDatabase(get().nodes, edges, get().milestones)
//     },
//     onConnect: (connection: any) => {
//         const edges = addEdge(
//             {
//                 ...connection,
//                 markerEnd: {
//                     type: MarkerType.ArrowClosed,
//                     width: 20,
//                     height: 20
//                 }
//             },
//             get().edges
//         )
//         set({ edges })
//         debouncedSaveToDatabase(get().nodes, edges, get().milestones)
//     },
//     setNodes: (nodes: Node[]) => {
//         set({ nodes })
//         debouncedSaveToDatabase(nodes, get().edges, get().milestones)
//     },
//     setEdges: (edges: Edge[]) => {
//         set({ edges })
//         debouncedSaveToDatabase(get().nodes, edges, get().milestones)
//     },
//     addNode: (node: Node) => {
//         const nodes = [...get().nodes, node]
//         const milestones = [...get().milestones, node.data]
//         set({ nodes })
//         set({ milestones })
//         debouncedSaveToDatabase(nodes, get().edges, milestones)
//     }
// }))

// Wrap saveToDatabase in a debounce function - to avoid spamming the database
export const debouncedSaveToDatabase = debounce(
    (nodes: Node[], edges: Edge[], milestones: any[]) => {
        saveToDatabase(nodes, edges, milestones)
    },
    500
)

export const saveToDatabase = async (
    nodes: Node[],
    edges: Edge[],
    milestones: any[]
) => {
    try {
        const response = await fetch("/api/flow/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nodes, edges, milestones }) // Send the nodes and edges as JSON
        })

        if (!response.ok) {
            throw new Error("Failed to save flow")
        }

        const data = await response.json()
        console.log(data.message) // "Flow saved successfully"
    } catch (error) {
        console.error("Error saving flow:", error)
    }
}
