import { NextRequest, NextResponse } from "next/server";
import prisma from "@comend/lib/prisma"
import { updateMilestones, updateEdges, updateDBFlow, createNodes, deleteNode, updateRoadmap } from "@comend/lib/actions";

type InOp = { kind: string; idempotencyKey: string; payload: any };

export async function POST(req: NextRequest) {
    const { ops } = (await req.json()) as { ops: InOp[] };
    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const op of ops) {
        try {
            // skip if already processed
            const seen = await prisma.roadmapIdempotency.findUnique({ where: { key: op.idempotencyKey } });
            if (seen) { succeeded.push(op.idempotencyKey); continue; }

            await prisma.$transaction(async (tx) => {
                switch (op.kind) {
                    case "UPDATE_ROADMAP":
                        await updateRoadmap(op.payload.orgId, op.payload.data, tx as any);
                        break;
                    case "UPDATE_MILESTONES":
                        await updateMilestones(op.payload.orgId, { milestones: op.payload.milestones }, tx as any);
                        break;
                    case "UPDATE_EDGES":
                        await updateEdges(op.payload.orgId, { roadmapId: op.payload.roadmapId, edges: op.payload.edges }, tx as any);
                        break;
                    case "UPDATE_FLOW":
                        await updateDBFlow(op.payload.orgId, {
                            roadmapId: op.payload.roadmapId, nodes: op.payload.nodes, edges: op.payload.edges
                        }, tx as any);
                        break;
                    case "CREATE_NODES":
                        await createNodes(op.payload.orgId, { roadmapId: op.payload.roadmapId, nodes: op.payload.nodes }, tx as any);
                        break;
                    case "DELETE_NODE":
                        await deleteNode(op.payload.orgId, op.payload.nodeId, tx as any);
                        break;
                    default:
                        throw new Error(`Unknown op: ${op.kind}`);
                }

                await tx.roadmapIdempotency.create({ data: { key: op.idempotencyKey, processedAt: new Date() } });
            });

            succeeded.push(op.idempotencyKey);
        } catch (e) {
            failed.push(op.idempotencyKey);
        }
    }

    return NextResponse.json({ succeeded, failed });
}
