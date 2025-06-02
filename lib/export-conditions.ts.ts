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

async function exportConditions() {
    const assets = await prisma.condition.findMany({
        include: {
            // assetsUnderDevelopment: true
        }
    })

    console.log(`Exporting conditions with data:`, assets)

    const jsonString = JSON.stringify(assets, null, 4) // convert to JSON with indentation
    const homeDir = require('os').homedir()
    const desktopDir = `${homeDir}/Desktop` 

    fs.writeFileSync(`${desktopDir}/conditions-export-${new Date()}.json`, jsonString)
}

async function exportFunc() {
    // var args = process.argv.slice(2)

    // await Promise.all(args.map(async (arg) => {
    //     try {
    //         if (typeof arg !== 'string') throw new Error('Invalid arg format. Ensure all args are strings representing a assets ID in the active database.')
            
    //         await exportAssets()
    //     } catch (e) {
    //         console.error(`Error exporing assets (${arg}): ${e}`)
    //     }
    // }))
    try {
        await exportConditions()
    } catch (e) {
        console.error(`Error exporing assets: ${e}`)
    }
}

// exports all assets
exportFunc()