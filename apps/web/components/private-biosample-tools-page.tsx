"use client"

import * as React from "react";
import Image from "next/image"
import { ToolState, useToolStore } from "@/state/tool/toolStore"
import { useShallow } from "zustand/react/shallow"
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { useEffect, useState } from "react"
import { Asset } from "@/packages/lib/types"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { Shell } from "@comend/components/biorepo/advanced-data-table/tasks-table/shell";
import {FeatureFlagsProvider} from "@comend/components/biorepo/advanced-data-table/biosamples-table/feature-flags-provider";
import { BiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/biosamples-table"
import { getBiosamplesTableColumns } from "./biosample-tool-data-table/biosamples-table-columns";

const toolSelector = (state: ToolState) => ({
    tools: state.tools,
    toolTypes: state.toolTypes
})

export const PrivateBiosampleToolsPage = ({promises}: {promises: any}) => {
    const { tools, toolTypes } = useToolStore(useShallow(toolSelector))
    const [filteredTools, setFilteredTools] = useState<Asset[]>([])

    const columns = getBiosamplesTableColumns()

    async function filterTools(tools: Asset[], type: 'biosample' | 'data') {
        const filteredTypes = toolTypes.filter(t => t.type === type)
        return tools.filter(tool => 
            // filter by type
            filteredTypes.some(t => tool.types.includes(t.id) ||
            // if the tool does not have a type, sort it into the 'data' bucket 
            (tool.types.length === 0 && type === 'data'))
        )
    }

    useEffect(() => {
        const init = async () => {
            const filtered: Asset[] = await filterTools(tools, "biosample")
            setFilteredTools(filtered)
        }
        init()
    }, [tools])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numAssetsPinned={filteredTools.filter(tool => tool.pinned).length} type={"biosample"}/>
            <AssetBulkImportDialog />
        </div>

        {filteredTools.length <= 0 ? (
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
                <NewToolDialog numAssetsPinned={tools.filter(tool => tool.pinned).length} type={"biosample"}/>
            </div>
        ): (
            <Shell className="gap-2">
                <FeatureFlagsProvider>
                    <React.Suspense
                        fallback={
                            <DataTableSkeleton
                                columnCount={7}
                                filterCount={2}
                                cellWidths={[
                                    "10rem",
                                    "30rem",
                                    "10rem",
                                    "10rem",
                                    "6rem",
                                    "6rem",
                                    "6rem",
                                ]}
                                shrinkZero
                            />
                        }
                    >
                        {/* <BiosamplesTable data={filteredTools} /> */}
                        <BiosamplesTable promises={promises} columns={columns}/>
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        )}
        </main>
    )
}