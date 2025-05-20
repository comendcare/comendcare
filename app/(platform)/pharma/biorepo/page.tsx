import {promises as fs} from "fs"
import path from "path"
import {z} from "zod"

import {DataTable} from "@/components/biorepo/data-table";
import {biosampleSchema} from "@/data/pharma-data/schema";
import {columns} from "@/components/biorepo/columns"

export default async function PharmaBiorepoPage() {
    async function getBiosamples() {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/biosamples.json")
        )

        const tasks = JSON.parse(data.toString())

        return z.array(biosampleSchema).parse(tasks)
    }

    const tasks = await getBiosamples()

    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-8 px-8 md:flex">
                <h2 className="text-2xl font-bold tracking-tight">BioRepo</h2>
                <DataTable data={tasks} columns={columns}/>
            </div>
        </>
    )
}
