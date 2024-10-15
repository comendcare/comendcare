import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges, Edge, MarkerType, Node, NodeChange, EdgeChange } from '@xyflow/react'
import { debounce } from 'lodash'

const initNodes: Node[] = [
    {
        id: '1',
        type: 'MILESTONE',
        data: { 
            title: 'Basic Science - Disease',
            description: 'Complete the basic science for investigating our disease.',
            tasks: [
                { name: 'Literature search to undersand disease', complete: true }
            ],
            notes: '',
            status: 'DONE'
        },
        position: { x: 0, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '2',
        type: 'MILESTONE',
        data: { 
            title: 'Disease Models',
            description: 'Discover, construct, and phenotype disease models.',
            deadline: new Date(),
            stakeholders: ['Person 1', 'Person 2'],
            labels: ['Label 1', 'Label 2'],
            tasks: [
                { name: 'Identify the best models currently available', complete: true },
                { name: 'Construct Knock-in Mice', complete: true },
                { name: 'Phenotyping of Knock-in Mice', complete: false },
                { name: 'Construct Fibroblasts', complete: true },
                { name: 'Construct iPSCs', complete: true },
                { name: 'Phenotype iPSCs', complete: false }
            ],
            dependencies: ['Basic Science - Disease'],
            budget: 100000,
            notes: 'Here are some notes as an example...',
            status: 'INPROGRESS'
        },
        position: { x: 600, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '3',
        type: 'MILESTONE',
        data: { 
            title: 'Pre-Clinical Design',
            description: 'Pre-clinical design and production.',
            tasks: [
                { name: 'Construct design', complete: false },
                { name: 'Plasmid production', complete: false },
                { name: 'AAV Production', complete: false},
            ],
            notes: 'Here are some extra notes as an example...',
            status: 'TODO'
        },
        position: { x: 1200, y: 0 },
        selected: false,
        selectable: true
    }
]

const initEdges: Edge[] = [
  {
      id: 'e1-2',
      source: '1',
      target: '2',
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
  },
  {
      id: 'e2-3',
      source: '2',
      target: '3',
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
  },
]


export type RoadmapState = {
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void, 
  nodes: Node[],
  edges: Edge[],
  onNodesChange: (changes: NodeChange[]) => void,
  onEdgesChange: (changes: EdgeChange[]) => void,
  onConnect: (connection: any) => void,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  addNode: (node: Node) => void
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id: string | null) => set({ selectedNodeId: id }),
  nodes: initNodes,
  edges: initEdges,
  onNodesChange: (changes: NodeChange[]) => {
    const nodes = applyNodeChanges(changes, get().nodes)
    set({ nodes })
    debouncedSaveToDatabase(nodes, get().edges)
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    const edges = applyEdgeChanges(changes, get().edges) 
    set({ edges })
    debouncedSaveToDatabase(get().nodes, edges)
  },
  onConnect: (connection: any) => {
    const edges = addEdge(
      {...connection, markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }}, 
      get().edges
    )
    set({ edges })
    debouncedSaveToDatabase(get().nodes, edges)
  },
  setNodes: (nodes: Node[]) => { set({ nodes }) },
  setEdges: (edges: Edge[]) => { set({ edges }) },
  addNode: (node: Node) => { 
    const nodes = [...get().nodes, node]
    set({ nodes }) 
    debouncedSaveToDatabase(nodes, get().edges)
  }
}))

// Wrap saveToDatabase in a debounce function - to avoid spamming the database
export const debouncedSaveToDatabase = debounce((nodes: Node[], edges: Edge[]) => {
  // saveToDatabase(nodes, edges)
  console.log(`Save to database: `)
  console.log(`Nodes: ${JSON.stringify(nodes)}`)
  console.log(`Edges: ${JSON.stringify(edges)}`)
}, 500); // 500ms debounce

// const saveToDatabase = async (nodes: Node[], edges: Edge[]) => {
//   try {
//       // Save or update nodes
//       await Promise.all(
//           nodes.map(async (node: any) => {
//               await prisma.node.upsert({
//               where: { id: node.id },
//               update: {
//                   type: node.type,
//                   positionX: node.position.x,
//                   positionY: node.position.y,
//                   // data: node.data,
//               },
//               create: {
//                   id: node.id,
//                   type: node.type,
//                   positionX: node.position.x,
//                   positionY: node.position.y,
//                   // data: node.data,
//               },
//               });
//           })
//       );

//       // Save or update edges
//       // await Promise.all(
//       //     edges.map(async (edge: any) => {
//       //         await prisma.edge.upsert({
//       //         where: { id: edge.id },
//       //         update: {
//       //             sourceId: edge.source,
//       //             targetId: edge.target,
//       //             label: edge.label,
//       //         },
//       //         create: {
//       //             id: edge.id,
//       //             sourceId: edge.source,
//       //             targetId: edge.target,
//       //             label: edge.label,
//       //         },
//       //         });
//       //     })
//       // );
//   } catch (error) {
//       console.error(`Error saving roadmap state to database`, error)
//   }
// }