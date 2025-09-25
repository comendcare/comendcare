// scripts/encrypt-existing-data.ts
import {PrismaClient} from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'
import { migrate } from './field-encryption-migrations' // the 'output' path above

async function main() {
    // Extend the client so reads/writes in the migration go through the extension
    const client = new PrismaClient().$extends(fieldEncryptionExtension())

    // Optional: see progress in CI logs
    const report = (p: {
        model: string
        processed: number
        totalCount: number
        performance: number // ms for last record
    }) => {
        console.log(
            `[encrypt] ${p.model}: ${p.processed}/${p.totalCount} (last ${p.performance.toFixed(0)}ms)`
        )
    }

    // NOTE: explicit cast is required by the lib
    await migrate((client as unknown) as PrismaClient, report)

    await (client as any).$disconnect()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
