"use client"

import Image from "next/image"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { columns } from "./assets-data-table/assets-data-columns";
import { columns as DataToolColumns, DataToolDataTable } from "./data-tool-data-table/data-tool-data-table"
import { columns as BiosampleToolColumns } from "./biosample-tool-data-table/biosample-tool-data-table"
import { AssetsDataTable } from "./assets-data-table/assets-data-table"
import { useEffect, useState } from "react"
import { Asset } from "@/packages/lib/types"
import { BiosampleToolDataTable } from "./biosample-tool-data-table/biosample-tool-data-table"

const toolSelector = (state: AssetState) => ({
    tools: state.tools,
    toolTypes: state.toolTypes
})

export const PrivateToolsPage = ({type}: {type: 'biosample' | 'data'}) => {
    const { tools, toolTypes } = useAssetStore(useShallow(toolSelector))
    const [filteredTools, setFilteredTools] = useState<Asset[]>([])

    useEffect(() => {
        const init = async () => {
            const filtered: Asset[] = await filterTools(tools, type)
            setFilteredTools(filtered)
        }
        init()
    }, [tools])

    async function filterTools(tools: Asset[], type: 'biosample' | 'data') {
        const filteredTypes = toolTypes.filter(t => t.type === type)
        return tools.filter(tool => filteredTypes.some(t => tool.types.includes(t.id)))
    }

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numAssetsPinned={filteredTools.filter(tool => tool.pinned).length} type={type}/>
            <AssetBulkImportDialog />
        </div>

        {filteredTools.length <= 0 && (
            <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                <h1 className="font-cal text-4xl">You do not have any Tools</h1>
                <Image
                    alt="No Tools"
                    src="https://illustrations.popsy.co/gray/graphic-design.svg"
                    width={300}
                    height={300}
                />
                <p className="text-lg text-stone-500">
                    A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                </p>
                <NewToolDialog numAssetsPinned={tools.filter(tool => tool.pinned).length} type={type}/>
            </div>
        )}
        {filteredTools.length > 0 && type === 'biosample' && (
            <BiosampleToolDataTable data={filteredTools} columns={BiosampleToolColumns} />
        )}
        {filteredTools.length > 0 && type === 'data' && (
            <DataToolDataTable data={filteredTools} columns={DataToolColumns} />
        )}
        {/* <AssetsDataTable data={filteredTools} columns={columns} type={type}/> */}
        </main>
    )
}
