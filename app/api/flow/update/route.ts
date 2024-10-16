import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client

export async function POST(request: Request) {
  try {
    const { nodes, edges, milestones } = await request.json()

    console.log(`Milestones: `, milestones)

    // Save or update nodes
    await Promise.all(
      nodes.map(async (node: any) => {
        await prisma.node.upsert({
          where: { id: node.id },
          update: {
            positionX: node.position?.x,
            positionY: node.position?.y,
          },
          create: {
            id: node.id,
            type: node.type,
            positionX: node.position?.x,
            positionY: node.position?.y,
            data: {
              create: {
                title: "New Milestone",
                status: "TODO"
              }
            }
          },
        })
      })
    )

    await Promise.all(
      milestones.map(async (milestone: any) => {
        console.log(`Saving Milestone Data: `, milestone)
        await prisma.milestone.update({
          where: { nodeId: milestone.nodeId },
          data: {
            // ...milestone,
            title: milestone.title,
            description: milestone.description,
            deadline: milestone.deadline,
            notes: milestone.notes,
            tasks: undefined
          }
        })
      })
    )

    // Save or update edges
    await Promise.all(
      edges.map(async (edge: any) => {
        await prisma.edge.upsert({
          where: { id: edge.id },
          update: {
            source: edge.source,
            target: edge.target,
          },
          create: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
          },
        })
      })
    )

    return NextResponse.json({ message: 'Flow saved successfully' }, { status: 200 })
  } catch (error) {
    console.error(`Error: `, error)
    return NextResponse.json({ error: 'Failed to save flow' }, { status: 500 })
  }
}