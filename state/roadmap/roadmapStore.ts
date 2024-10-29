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
    roadmapId: string | null
    setRoadmapId: (id: string) => void
    selectedNodeId: string | null
    setSelectedNodeId: (id: string | null) => void
    selectedTaskId: string | null,
    setSelectedTaskId: (id: string | null) => void
    // tasks: any[]
    setTask: (taskId: string, newProperties: any) => void
    // setTasks: (tasks: any[]) => void
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
    initState: (nodes: Node[], edges: Edge[], milestones: any[], selectedNodeId: string | null, selectedTaskId: string | null, roadmapId: string) => void
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
        roadmapId: null,
        setRoadmapId: (id: string) => {
            set({ roadmapId: id })
        },
        selectedNodeId: null,
        setSelectedNodeId: (id: string | null) => {
            set({ selectedNodeId: id })
        },
        selectedTaskId: null,
        setSelectedTaskId: (id: string | null) => {
            set({ selectedTaskId: id })
        },
        setTask: (taskId: string, newProperties: any) => {
            const milestones = get().milestones.map(milestone => {
                if (milestone.tasks.map((task: any) => task.id).includes(taskId)) {
                    return {
                        ...milestone,
                        tasks: milestone.tasks.map((task: any) => (
                            task.id === taskId ? {...task, ...newProperties} : task
                        ))
                    }
                } else {
                    return milestone
                }
            })
            set({ milestones })
            const task = get().milestones.map(milestone => milestone?.tasks || []).flat(1).filter(task => task.id === taskId)
            if (task) updateTasks(task)
        },
        milestones: [],
        setMilestone: (nodeId: string, newProperties: any) => {
            const milestones = get().milestones.map(milestone =>
                milestone.nodeId === nodeId
                    ? { ...milestone, ...newProperties }
                    : milestone
            )
            set({ milestones })
            updateMilestones(milestones.filter(milestone => milestone.nodeId === nodeId))
        },
        setMilestones: (milestones: any[]) => {
            set({ milestones })
            updateMilestones(milestones)
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
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20
                    }
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
        addNode: (node: Node) => {
            const nodes = [...get().nodes, node]
            const milestones = [...get().milestones, node.data]
            set({ nodes, milestones })
            debounceUpdateFlow(get().roadmapId, nodes, get().edges)
            updateMilestones([node.data])
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
            set({ nodes, edges, milestones, selectedNodeId, selectedTaskId, roadmapId })
        },
        saveState: () => {
            const state = get()
            set(state)
            debounceUpdateFlow(state.roadmapId, state.nodes, state.edges)
            updateMilestones(state.milestones)
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
        updateFlow(roadmapId, nodes, edges)
    }, 500
)

export const updateFlow = async (
    roadmapId: string | null,
    nodes: Node[],
    edges: Edge[]
) => {
    try {
        const response = await fetch("/api/flow/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ roadmapId, nodes, edges }) // Send the nodes and edges as JSON
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

export const updateMilestones = async (
    milestones: any[] // milestones to update
) => {
    try {
        const response = await fetch("/api/milestone/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ milestones })
        })

        if (!response.ok) {
            throw new Error("Failed to save milestones")
        }

        const data = await response.json()
        console.log(data.message)
    } catch (error) {
        console.error("Error saving milestones:", error)
    }
}

export const updateTasks = async (
    tasks: any[] // tasks to update
) => {
    try {
        const response = await fetch("/api/task/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tasks })
        })

        if (!response.ok) {
            throw new Error("Failed to save tasks")
        }

        const data = await response.json()
        console.log(data.message)
    } catch (error) {
        console.error("Error saving tasks:", error)
    }
}

// export const updateTasks = async (
//     tasks: any[] // tasks to update
// ) => {
//     try {
//         const response = await fetch("/api/milestone/update", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ tasks })
//         })

//         if (!response.ok) {
//             throw new Error("Failed to save flow")
//         }

//         const data = await response.json()
//         console.log(data.message)
//     } catch (error) {
//         console.error("Error saving flow:", error)
//     }
// }

// export const saveToDatabase = async (
//     nodes: Node[],
//     edges: Edge[],
//     milestones: any[]
// ) => {
//     try {
//         const response = await fetch("/api/flow/update", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ nodes, edges, milestones }) // Send the nodes and edges as JSON
//         })

//         if (!response.ok) {
//             throw new Error("Failed to save flow")
//         }

//         const data = await response.json()
//         console.log(data.message) // "Flow saved successfully"
//     } catch (error) {
//         console.error("Error saving flow:", error)
//     }
// }

