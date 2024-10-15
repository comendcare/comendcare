import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to your Prisma client

export async function POST(request: Request) {
  try {
    // const { nodes, edges } = await request.json();

    // TODO: delete logic here...

    // Save or update nodes
    // await Promise.all(
    //   nodes.map(async (node: any) => {
    //     await prisma.node.upsert({
    //       where: { id: node.id },
    //       update: {
    //         positionX: node.position.x,
    //         positionY: node.position.y,
    //       },
    //       create: {
    //         id: node.id,
    //         type: node.type,
    //         positionX: node.position.x,
    //         positionY: node.position.y,
    //         data: {
    //           create: {
    //             title: node.data.title,
    //             status: node.data.status
    //           }
    //         }
    //       },
    //     });
    //   })
    // );

    // Save or update edges
    // await Promise.all(
    //   edges.map(async (edge: any) => {
    //     await prisma.edge.upsert({
    //       where: { id: edge.id },
    //       update: {
    //         source: edge.source,
    //         target: edge.target,
    //       },
    //       create: {
    //         id: edge.id,
    //         source: edge.source,
    //         target: edge.target,
    //       },
    //     });
    //   })
    // );

    return NextResponse.json({ message: 'Flow saved successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save flow' }, { status: 500 });
  }
}