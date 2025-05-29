"use client"

import Image from "next/image"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import { NewAssetDialog } from "./edit-asset-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { columns } from "@/components/assets-data-table/assets-data-columns";
import { AssetsDataTable } from "./assets-data-table/assets-data-table"

const toolSelector = (state: AssetState) => ({
    tools: state.tools
})

export const PrivateAssetsPage = () => {
    const { tools } = useAssetStore(useShallow(toolSelector))

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto">
        <div className="flex gap-2 w-full justify-end">
            <NewAssetDialog iconOnly={true} numAssetsPinned={tools.filter(tool => tool.pinned).length}/>
            <AssetBulkImportDialog />
        </div>

        {tools.length <= 0 && (
            <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                <h1 className="font-cal text-4xl">You do not have any Tools</h1>
                <Image
                    alt="No Tools"
                    src="https://illustrations.popsy.co/gray/graphic-design.svg"
                    width={300}
                    height={300}
                />
                <p className="text-lg text-stone-500">
                    A tool is a milestone outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                </p>
                <NewAssetDialog numAssetsPinned={tools.filter(tool => tool.pinned).length}/>
            </div>
        )}
        {tools.length > 0 && (
            <AssetsDataTable data={tools} columns={columns}/>
        )}
        </main>
    )
}