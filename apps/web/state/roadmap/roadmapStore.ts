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
    moveNodes,
    updateEdges,
    updateMilestones,
    updateMilestonesVisibility,
    updateRoadmap
} from "@comend/lib/actions"
import {toast} from "sonner"
import {nanoid} from "nanoid"
import {editResearchPlanForm, Milestone, Roadmap} from "@comend/lib/types"
import {mixpanelTrack} from "@comend/lib/mixpanel";
import z from "zod"

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
    setDetails: (id: string, orgId: string, data: z.infer<typeof editResearchPlanForm>) => Promise<void>
    onboardingActive: boolean,
    setOnboardingActive: (active: boolean) => void,
    roadmapId: string | null
    setRoadmapId: (id: string | null) => void
    selectedView: string | null,
    setSelectedView: (view: string | null) => void,
    selectedNodeIds: string[]
    setSelectedNodeIds: (ids: string[]) => void
    milestones: Milestone[]
    setMilestonesVisibility: (milestones: Milestone[], isPrivate: boolean) => Promise<Milestone[] | void>
    setMilestone: (id: string, newProperties: Partial<Milestone>) => Promise<Milestone[] | void>
    setMilestones: (milestones: Milestone[]) => Promise<Milestone[] | void>
    nodes: Node[]
    edges: Edge[]
    onEdgesChange: (changes: EdgeChange[]) => Promise<Edge[] | void>
    onConnect: (connection: Connection) => Promise<Edge[] | void>
    moveNodes: (nodes: Node[]) => Promise<Node[] | void>
    setEdges: (edges: Edge[]) => Promise<Edge[] | void>
    addMilestones: (milestones: Partial<Milestone>[], creationMethod?: string) => Promise<Node[] | void>
    addNodes: (node: Node[], creationMethod?: string) => Promise<Node[] | void>
    addNodesFromTemplate: (template: any) => Promise<Node[]>
    deleteNode: (nodeId: string) => Promise<void>
    // saveState: () => void
    savingList: string[]
    savingListAdd: (ids: string[]) => void
    savingListRemove: (ids: string[]) => void
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
            setDetails: async (id: string, orgId: string, data: z.infer<typeof editResearchPlanForm>) => {
                if (!id) {
                    console.error(`Error: no active research plan!`)
                    return
                }

                if (!data) {
                    console.error(`Error: research plan details are not intialized.`)
                    return
                }

                // fetch the updated org id OR (if it hasn't been updated) fetch the org id from the current roadmap
                // used for authorization - check if the user has access to edit this roadmap
                // const orgId = get().details?.organizationId
                // if (!orgId) {
                //     console.error(`Error: this research plan is not associated with an organization!`)
                //     return
                // }
                const roadmap = await updateRoadmap(orgId, {
                    id,
                    title: data.title,
                    description: data.description || null,
                    modalities: data.modalities?.map(modality => modality.value) || [],
                    metadata: data.metadata || null,
                    partners: data?.partners || undefined,
                    stages: data?.stages?.map(stage => stage.value) || [],
                    statuses: data?.statuses?.map(status => status.value) || [],
                    links: data?.links || undefined,
                })
                
                console.log(`roadmap data`, roadmap)
                
                if (roadmap) set({ details: roadmap as Roadmap })
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
                if (newProperties?.id) get().savingListAdd([newProperties.id])

                const milestones = get().milestones.map(milestone =>
                    milestone.nodeId === nodeId
                        ? {...milestone, ...newProperties}
                        : milestone
                )
                set({milestones})

                // update DB milestones
                const response = await updateMilestones(get().details?.organizationId, {milestones: milestones.filter(milestone => milestone.nodeId === nodeId)})
                if (response?.success && response?.data) {
                    console.log(`successfully updated milestone`)
                    if (newProperties?.id) get().savingListRemove([newProperties.id])
                    return response.data as Milestone[]
                } else {
                    toast.error("Could not update milestones", {position: "bottom-left"})
                    console.error(`Error updating milestones`, response?.error)
                }
                
                if (newProperties?.id) get().savingListRemove([newProperties.id])
            },
            setMilestonesVisibility: async (milestones: Milestone[], isPrivate: boolean) => {
                // faster version of set milestones used for updating visibility quickly for many milestones at a time
                console.log(`set milestones visibility`)
                get().savingListAdd(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))

                const updatedMilestones = get().milestones.map((existingMilestone) => {
                    if (milestones.map(m => m.id).includes(existingMilestone.id)) {
                        return ({
                            ...existingMilestone,
                            private: isPrivate
                        })
                    } else {
                        return existingMilestone
                    }
                })

                // update DB milestones
                const response = await updateMilestonesVisibility(get().details?.organizationId, {milestones, isPrivate})
                if (response?.success && response?.data) {
                    get().savingListRemove(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))
                    // reset selected node ids to remount edit milestone form if it's open
                    set({milestones: updatedMilestones, selectedNodeIds: [...get().selectedNodeIds]})
                    return response.data as Milestone[]
                } else {
                    toast.error("Could not update milestones", {position: "bottom-left"})
                    console.error(`Error updating milestones`, response?.error)
                }

                get().savingListRemove(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))
            },
            setMilestones: async (milestones: Milestone[]) => {
                console.log(`set milestones`)
                get().savingListAdd(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))
                
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
                    get().savingListRemove(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))
                    return response.data as Milestone[]
                } else {
                    toast.error("Could not update milestones", {position: "bottom-left"})
                    console.error(`Error updating milestones`, response?.error)
                }

                get().savingListRemove(milestones.filter(milestone => !!milestone.id).map(milestone => milestone.id))
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
            },
            moveNodes: async (nodes: Node[]) => {
                console.log(`move nodes`)

                // if nothing has changed, block this
                if (JSON.stringify(nodes) === JSON.stringify(get().nodes)) return
                
                const updatedNodes = get().nodes.map(originalNode => {
                    const foundIndex = nodes.findIndex(newNode => newNode.id === originalNode.id)
                    if (foundIndex >= 0) return nodes[foundIndex]
                    else return originalNode
                })

                set({nodes: updatedNodes})

                const orgId = get().details?.organizationId
                const response = await moveNodes(orgId, nodes)
                if (response?.success && response?.data) {
                    const newNodes = response.data.map((n: any) => ({
                        id: n.id,
                        position: {x: n.positionX, y: n.positionY},
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
                set({edges})

                // update DB edges
                const response = await updateEdges(get().details?.organizationId, {roadmapId: get().roadmapId, edges})
                if (response?.success && response?.data) {
                    return response.data as Edge[]
                } else {
                    console.error(`Error updating Flow Edges`, response?.error)
                }
            },
            addMilestones: async (milestones: Partial<Milestone>[], creationMethod?: string) => {
                console.log(`add milestones`, milestones)
                const newNodes: Node[] = []
                const milestonesAlongXAxis = get().nodes.sort((a, b) => {
                    return a?.position?.x - b?.position?.x
                })
                let centerX = milestonesAlongXAxis.length > 0 ? ((milestonesAlongXAxis[milestonesAlongXAxis.length - 1]?.position?.x || 0) + 500) : (0)
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
                            ...defaultData,
                            id: milestoneId,
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

                    newNodes.push(newNode)
                })

                const nodes = await get().addNodes(newNodes, creationMethod)
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
            },
            addNodesFromTemplate: async (template: any) => {
                const response = await createNodesAndEdgesFromTemplate(get().details?.organizationId, get().roadmapId, template)
                if (response.success && response.data && response.data.nodes && response.data.milestones && response.data.edges) {
                    const newNodes = response.data.nodes.filter((node: any) => !get().nodes.map(n => n.id).includes(node.id))
                    set({
                        nodes: (response.data.nodes.map((node: any) => ({
                            ...node,
                            position: {x: node.positionX, y: node.positionY}
                        }))),
                        milestones: response.data.milestones,
                        edges: response.data.edges
                    })
                    return newNodes
                } else {
                    console.error(`Error adding nodes`, response?.error)
                    toast.error(`Error adding projects from template: ${response?.error}`)
                }
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
            },
            savingList: [],
            savingListAdd: (ids: string[]) => {
                set({savingList: [...get().savingList, ...ids]})
            },
            savingListRemove: (ids: string[]) => {
                ids.forEach(id => {
                    const saved = get().savingList
                    const index = saved.findIndex(elementId => elementId === id)

                    // if the item was found in the list, remove the first instance
                    if (index >= 0) {
                        saved.splice(index, 1)
                        set({savingList: [...saved]})
                    }
                })
            },
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
