"use client"

import Image from "next/image"
import { ToolState, useToolStore } from "@/state/tool/toolStore"
import { useShallow } from "zustand/react/shallow"
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { columns as DataToolColumns, DataToolDataTable } from "./data-tool-data-table/data-tool-data-table"
import { useEffect, useState } from "react"
import { Asset } from "@/packages/lib/types"

import * as React from "react";

const toolSelector = (state: ToolState) => ({
    tools: state.tools,
    toolTypes: state.toolTypes
})

export const PrivateDataToolsPage = () => {
    const { tools, toolTypes } = useToolStore(useShallow(toolSelector))
    const [filteredTools, setFilteredTools] = useState<Asset[]>([])

    async function filterTools(tools: Asset[]) {
        const filteredTypes = toolTypes.filter(t => t.type === 'data')
        return tools.filter(tool => 
            // filter by type
            filteredTypes.some(t => tool.types.includes(t.id) ||
            // if the tool does not have a type, sort it into the 'data' bucket 
            (tool.types.length === 0))
        )
    }

    useEffect(() => {
        const init = async () => {
            const filtered: Asset[] = await filterTools(tools)
            setFilteredTools(filtered)
        }
        init()
    }, [tools])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numAssetsPinned={filteredTools.filter(tool => tool.pinned).length} type={"data"}/>
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
                <NewToolDialog numAssetsPinned={tools.filter(tool => tool.pinned).length} type={"data"}/>
            </div>
        )}
        {filteredTools.length > 0 && (
            <DataToolDataTable data={filteredTools} columns={DataToolColumns} />
        )}
        {/* <AssetsDataTable data={filteredTools} columns={columns} type={type}/> */}
        </main>
    )
}