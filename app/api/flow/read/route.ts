import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const nodes = await prisma.node.findMany();
    const edges = await prisma.edge.findMany();

    res.status(200).json({ nodes, edges });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
}