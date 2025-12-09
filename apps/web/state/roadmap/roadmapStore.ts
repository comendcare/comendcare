import {create} from "zustand"
import {temporal} from 'zundo'
import {
    addEdge,
    applyEdgeChanges,
    Edge,
    Node,
    EdgeChange,
    Connection
} from "@xyflow/react"
import {
    createNodes,
    createNodesAndEdgesFromTemplate,
    deleteNode,
    updateDBFlow,
    updateEdges,
    updateMilestones,
    updateRoadmap
} from "@comend/lib/actions"
import {toast} from "sonner"
import {nanoid} from "nanoid"
import {Milestone, Roadmap} from "@comend/lib/types"
import {getMilestoneTypes} from "@comend/lib/fetchers"
import {mixpanelTrack} from "@comend/lib/mixpanel";

export type RoadmapState = {
    initialized: boolean,
    initState: (
        details: Roadmap | undefined,
        nodes: Node[],
        edges: Edge[],
        milestones: Milestone[],
        selectedView: string | null,
        selectedNodeIds: string[],
        selectedTaskId: string | null,
        roadmapId: string
    ) => void,
    details: Roadmap | undefined,
    setDetails: (details: Partial<Roadmap>) => Promise<void>
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string | null) => void
    selectedView: string | null,
    setSelectedView: (view: string | null) => void,
    selectedNodeIds: string[]
    setSelectedNodeIds: (ids: string[]) => void
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
    addMilestonesFromTemplate: (template: any) => Promise<Node[]>
    deleteNode: (nodeId: string) => Promise<void>
    saveState: () => void
}

export const useRoadmapStore = create<RoadmapState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: (details: Roadmap | undefined, nodes: Node[], edges: Edge[], milestones: Milestone[], selectedView: string | null, selectedNodeIds: string[], selectedTaskId: string | null, roadmapId: string) => {
                console.log(`init roadmap state`)
                const edgesWithMarker = edges.map(edge => ({
                    ...edge,
                    style: {stroke: 'black'}
                }))
                set({
                    details: details,
                    initialized: true,
                    nodes,
                    edges: edgesWithMarker,
                    milestones,
                    selectedView,
                    selectedNodeIds,
                    roadmapId
                })
            },
            details: undefined,
            setDetails: async (details: Partial<Roadmap> | undefined) => {
                const id = get().roadmapId
                if (!id) {
                    console.error(`Error: no active research plan!`)
                    return
                }

                if (!details) {
                    console.error(`Error: research plan details are not intialized.`)
                    return
                }

                // fetch the updated org id OR (if it hasn't been updated) fetch the org id from the current roadmap
                // used for authorization - check if the user has access to edit this roadmap
                const orgId = details?.organizationId || get().details?.organizationId
                if (!orgId) {
                    console.error(`Error: this research plan is not associated with an organization!`)
                    return
                }

                const roadmap = await updateRoadmap(orgId, {
                    id,
                    title: details.title,
                    description: details.description || null,
                    modalities: details.modalities || [],
                    metadata: details.metadata || null
                })
                
                console.log(`roadmap data`, roadmap)
                
                if (roadmap) set({ details: roadmap as Roadmap })

                // optimistic local
                set({details: {...(get().details || {}), ...details} as any});
                // durable op
                // const {enqueue} = useWriteQueue.getState();
                // enqueue({
                //     kind: "UPDATE_ROADMAP", payload: {
                //         orgId, data: {
                //             id,
                //             title: details.title,
                //             description: details.description ?? null,
                //             modalities: details.modalities ?? [],
                //             metadata: details.metadata ?? null
                //         }
                //     }
                // });
            },
            onboardingActive: true,
            setOnboardingActive: (active: boolean) => {
                console.log(`set onboarding active`)
                set({onboardingActive: active})
            },
            roadmapId: null,
            setRoadmapId: (id: string | null) => {
                console.log(`set roadmap id`)
                set({roadmapId: id})
            },
            selectedView: null,
            setSelectedView: (view: string | null) => {
                set({selectedView: view})
            },
            selectedNodeIds: [],
            setSelectedNodeIds: (ids: string[]) => {
                set({selectedNodeIds: ids})
            },
            milestones: [],
            setMilestone: async (nodeId: string | null, newProperties: Partial<Milestone>) => {
                console.log(`set milestone`)
                const milestones = get().milestones.map(milestone =>
                    milestone.nodeId === nodeId
                        ? {...milestone, ...newProperties}
                        : milestone
                )
                set({milestones})

                // update DB milestones
                const response = await updateMilestones(get().details?.organizationId, {milestones: milestones.filter(milestone => milestone.nodeId === nodeId)})
                if (response?.success && response?.data) {
                    console.log(`successfully updated milestone`, response)
                    return response.data as Milestone[]
                } else {
                    toast.error("Could not update milestones", {position: "bottom-left"})
                    console.error(`Error updating milestones`, response?.error)
                }
                // const {enqueue} = useWriteQueue.getState();
                // enqueue({
                //     kind: "UPDATE_MILESTONES",
                //     payload: {orgId: get().details?.organizationId, milestones}
                // });
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
                set({milestones: updatedMilestones})

                // update DB milestones
                const response = await updateMilestones(get().details?.organizationId, {milestones: updatedMilestones})
                if (response?.success && response?.data) {
                    return response.data as Milestone[]
                } else {
                    toast.error("Could not update milestones", {position: "bottom-left"})
                    console.error(`Error updating milestones`, response?.error)
                }
                // const {enqueue} = useWriteQueue.getState();
                // enqueue({
                //     kind: "UPDATE_MILESTONES",
                //     payload: {orgId: get().details?.organizationId, milestones: updatedMilestones}
                // });
            },
            nodes: [],
            edges: [],
            onEdgesChange: async (changes: EdgeChange[]) => {
                console.log(`on edges change`)
                const edges = applyEdgeChanges(changes, get().edges)
                set({edges})

                // update DB edges
                const response = await updateEdges(get().details?.organizationId, {roadmapId: get().roadmapId, edges})
                if (response?.success && response?.data) {
                    return response.data as Edge[]
                } else {
                    toast.error("Could not update edges", {position: "bottom-left"})
                    console.error(`Error updating Flow Edges`, response?.error)
                }
                // useWriteQueue.getState().enqueue({
                //     kind: "UPDATE_EDGES",
                //     payload: {orgId: get().details?.organizationId, roadmapId: get().roadmapId, edges}
                // });
            },
            onConnect: async (connection: Connection) => {
                // don't add edges from preview node
                if (connection.source === 'preview' || connection.target === 'preview') return

                const edges = addEdge(
                    {...connection, style: {stroke: 'black'}},
                    get().edges
                )
                set({edges})

                // update DB edges
                const response = await updateEdges(get().details?.organizationId, {roadmapId: get().roadmapId, edges})
                if (response?.success && response?.data) {
                    return response.data as Edge[]
                } else {
                    toast.error("Could not update edges", {position: "bottom-left"})
                    console.error(`Error updating Flow Edges`, response?.error)
                }
                // useWriteQueue.getState().enqueue({
                //     kind: "UPDATE_EDGES",
                //     payload: {orgId: get().details?.organizationId, roadmapId: get().roadmapId, edges}
                // });
            },
            setNodes: async (nodes: Node[]) => {
                console.log(`set nodes`)
                set({nodes})

                const orgId = get().details?.organizationId
                const response = await updateDBFlow(orgId, {roadmapId: get().roadmapId, nodes, edges: get().edges})
                if (response?.success && response?.data) {
                    const newNodes = response.data.nodes.map((n: any) => ({
                        id: n.id,
                        position: {x: n.positionX, y: n.positionY},
                        origin: n.origin
                    })) as Node[]
                
                    return newNodes as Node[]
                } else {
                    console.error(`Error updating database nodes`, response?.error)
                    toast.success("Error updating node state... your node may node's position may not have been saved")
                }
                // const orgId = get().details?.organizationId;
                // useWriteQueue.getState().enqueue({
                //     kind: "UPDATE_FLOW",
                //     payload: {orgId, roadmapId: get().roadmapId, nodes, edges: get().edges}
                // });
            },
            setEdges: async (edges: Edge[]) => {
                console.log(`set edges`)
                set({edges})

                // update DB edges
                const response = await updateEdges(get().details?.organizationId, {roadmapId: get().roadmapId, edges})
                if (response?.success && response?.data) {
                    return response.data as Edge[]
                } else {
                    console.error(`Error updating Flow Edges`, response?.error)
                }
                // useWriteQueue.getState().enqueue({
                //     kind: "UPDATE_EDGES",
                //     payload: {orgId: get().details?.organizationId, roadmapId: get().roadmapId, edges}
                // });
            },
            addMilestones: async (milestones: Partial<Milestone>[], creationMethod?: string) => {
                console.log(`start add milestones`, Date.now())

                const milestonesAlongXAxis = get().nodes.sort((a, b) => {
                    return a?.position?.x - b?.position?.x
                })
                let centerX = milestonesAlongXAxis.length > 0 ? ((milestonesAlongXAxis[milestonesAlongXAxis.length - 1]?.position?.x || 0) + 500) : (0)
                let centerY = 0

                const newNodes = milestones.map((defaultData, index) => {
                    const id = nanoid()
                    // const milestoneId = nanoid()
                    const newNode: Node = {
                        id: id,
                        type: defaultData?.nodeType || "PROJECT",
                        position: {
                            x: centerX,
                            y: centerY
                        },
                        origin: [0.0, 0.0],
                        data: {
                            ...defaultData,
                            // id: milestoneId,
                            nodeId: id,
                            private: defaultData?.private !== null && defaultData?.private !== undefined ? defaultData.private: true,
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

                    return newNode
                })

                console.log(`finished processing milestones`, Date.now())

                const nodes = await get().addNodes(newNodes, creationMethod)

                console.log(`finished adding nodes`, Date.now())
                return nodes
            },
            addNodes: async (nodes: Node[], creationMethod?: string) => {
                set({
                    nodes: [...get().nodes, ...nodes],
                    milestones: [...get().milestones, ...nodes.map(node => node.data as Milestone)]
                })

                // update DB Nodes
                const response = await createNodes(get().details?.organizationId, {roadmapId: get().roadmapId, nodes})
                if (response?.success && response?.data && response.data.nodes && response.data.milestones) {
                    response.data.milestones.forEach((milestone: any) => {
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
                // useWriteQueue.getState().enqueue({
                //     kind: "CREATE_NODES",
                //     payload: {orgId: get().details?.organizationId, roadmapId: get().roadmapId, nodes, creationMethod}
                // });
            },
            addMilestonesFromTemplate: async (template: any) => {
                // maps the original node id (from the template) to the new node ID that's stored in the DB
                const nodeIDMap: { [originalNodeId: string]: string } = {}
        
                // if a roadmap template was provided, create the relevant nodes, milestones, and edges
                if (template?.milestones) {
                    const milestones = template.milestones
        
                    const newNodes = await Promise.all(
                        milestones.map(async (milestone: any, index: number) => {
                            // find the node associated with the milestone, used to fetch position information
                            const templateNode = template.nodes.find((n: any) => n.id === milestone.nodeId)
                            const id = nanoid()
        
                            // create Node & associated Milestone
                            const node = {
                                id: id,
                                type: templateNode.nodeType || "PROJECT",
                                position: {
                                    x: templateNode ? templateNode.positionX : index * 500,
                                    y: templateNode ? templateNode.positionY : 0,
                                },
                                origin: [0.0, 0.0],
                                data: {
                                    ...milestone,
                                    // id: milestoneId,
                                    nodeId: id,
                                    private: milestone?.private !== null && milestone?.private !== undefined ? milestone.private: true,
                                    timelineOrder: get().milestones.length + index, // add in last position in timeline
                                    nodeType: milestone?.nodeType || "PROJECT",
                                    title: milestone?.title || 'New Milestone',
                                    description: milestone?.description || '',
                                    types: milestone?.types,
                                    status: milestone?.status || "PLANNED",
                                }
                            }
        
                            // append to node ID map, this is used to create edges so we can map the template node ID to the
                            // new node ID that will be used in the database
                            if (templateNode) nodeIDMap[templateNode.id] = node.id
        
                            return node
                        })
                    )

                    // let newEdges = []
        
                    // create any edges that are connecting nodes
                    // if (template.edges) {
                    //     newEdges = template.edges.map((edge: Edge, index: number) => ({
                    //         source: nodeIDMap[edge.source] || edge.source,
                    //         target: nodeIDMap[edge.target] || edge.target,
                    //     }))
                    // } else {
                    //     // template doesn't have any defined edges, use default edge generation
                    //     for (let i = 0; i < newNodes.length - 1; i++) {
                    //         newEdges.push({
                    //             source: newNodes[i]?.id,
                    //             target: newNodes[i+1]?.id,
                    //         })
                    //     }
                    // }

                    // const edges = addEdge(
                    //     {...connection, style: {stroke: 'black'}},
                    //     get().edges
                    // )

                    // update DB edges
                    // const response = await updateEdges(get().details?.organizationId, {roadmapId: get().roadmapId, edges})

                    const nodes = await get().addNodes(newNodes, 'template')
                    return nodes || []
                }

                return [] as Node[]
            },
            deleteNode: async (nodeId: string | undefined) => {
                console.log(`delete nodes`)
                const nodes = [...get().nodes].filter(({id}) => id !== nodeId)
                const milestones = get().milestones.filter(milestone =>
                    milestone.nodeId !== nodeId
                )
                set({nodes, milestones, selectedNodeIds: []})

                // update DB nodes
                const response = await deleteNode(get().details?.organizationId, nodeId)
                if (response?.success && response?.data) {
                    // don't return anything
                } else {
                    console.error(`Error deleting nodes`, response?.error)
                    toast.error(`Error deleting milestone: ${response?.error}`)
                }
                // useWriteQueue.getState().enqueue({
                //     kind: "DELETE_NODE",
                //     payload: {orgId: get().details?.organizationId, nodeId}
                // });
            },
            saveState: () => {
                console.log(`save state`)
                const state = get()
                updateDBFlow(state.details?.organizationId, {
                    roadmapId: state.roadmapId,
                    nodes: state.nodes,
                    edges: state.edges
                })
                updateMilestones(state.details?.organizationId, {milestones: state.milestones})
                // const {enqueue} = useWriteQueue.getState();
                // enqueue({
                //     kind: "UPDATE_FLOW",
                //     payload: {orgId: state.details?.organizationId, roadmapId: state.roadmapId, nodes: state.nodes, edges: state.edges}
                // });
                // enqueue({kind: "UPDATE_MILESTONES", payload: {orgId: state.details?.organizationId, milestones: state.milestones}});
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
                const {selectedNodeIds, nodes, edges, milestones, details, ...rest} = state;
                return {selectedNodeIds, nodes, edges, milestones, details};
            },
        })
)
