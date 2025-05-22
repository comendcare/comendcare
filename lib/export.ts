import fs from 'fs'
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'; // Prevent caching

const initPrismaClient = () => {
    console.log('Initializing Prisma client...');
    const client = new PrismaClient();
    console.log('Prisma client initialized.');
    return client;
};

const prisma = initPrismaClient()

async function exportResearchPlan(researchPlanId: string) {
    const researchPlan = await prisma?.roadmap.findUnique({
        where: {id: researchPlanId},
        include: {
            milestones: true,
            nodes: true,
            edges: true,
        }
    })

    console.log(`Exporting research plan with data:`, researchPlan)

    const jsonString = JSON.stringify(researchPlan, null, 4) // convert to JSON with indentation
    const homeDir = require('os').homedir()
    const desktopDir = `${homeDir}/Desktop` 

    fs.writeFileSync(`${desktopDir}/${researchPlan?.title}-${researchPlan?.id}.json`, jsonString)
}

async function exportFunc() {
    var args = process.argv.slice(2)

    await Promise.all(args.map(async (arg) => {
        try {
            if (typeof arg !== 'string') throw new Error('Invalid arg format. Ensure all args are strings representing a research plan ID in the active database.')
            
            await exportResearchPlan(arg)
        } catch (e) {
            console.error(`Error exporing research plan (${arg}): ${e}`)
        }
    }))
}

// odylia research plan id: cm9ud3w9v0000zzb8a7osd7r5
// megan's test research plan: cmah493yq0004gkyodk5j6m0p

// example usage: npx tsx ./lib/export.ts <first research plan id> <second research plan id>
// example usage: npx tsx ./lib/export.ts cmah493yq0004gkyodk5j6m0p
exportFunc()