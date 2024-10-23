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
    deleteNode: (nodeId: string) => void
    saveState: () => void
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
            set({ nodes, milestones })
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            const edges = applyEdgeChanges(changes, get().edges)
            set({ edges })
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
        },
        setNodes: (nodes: Node[]) => {
            set({ nodes })
        },
        setEdges: (edges: Edge[]) => {
            set({ edges })
        },
        addNode: (node: Node) => {
            const nodes = [...get().nodes, node]
            const milestones = [...get().milestones, node.data]
            set({ nodes, milestones })
        },
        deleteNode: (nodeId: string | undefined) => {
            const nodes = [...get().nodes].filter(({ id }) => id !== nodeId)
            const nodeIds = nodes.map(node => node.id)
            const milestones = get().milestones.filter(milestone =>
                nodeIds.includes(milestone.nodeId)
            )
            set({ nodes, milestones, selectedNodeId: null })
        },
        saveState: () => {
            const state = get()
            set(state)
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
            console.log(`Saved State: `, currentState)
            debouncedSaveToDatabase(currentState.nodes, currentState.edges, currentState.milestones)
            return
        },
    })
)

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

