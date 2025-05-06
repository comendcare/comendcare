"use client"

import Image from "next/image"
import { ToolState, useToolStore } from "@/state/tool/toolStore"
import { useShallow } from "zustand/react/shallow"
import { NewToolDialog } from "./edit-tool-dialog"
import { ToolBulkImportDialog } from "./tool-bulk-import-dialog"
import { columns } from "@/components/tools-data-table/tools-data-columns";
import { ToolsDataTable } from "./tools-data-table/tools-data-table"

const toolSelector = (state: ToolState) => ({
    tools: state.tools
})

export const PrivateToolsPage = () => {
    const { tools } = useToolStore(useShallow(toolSelector))

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numToolsPinned={tools.filter(tool => tool.pinned).length}/>
            <ToolBulkImportDialog />
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
                    An tool is a milestone outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                </p>
                <NewToolDialog numToolsPinned={tools.filter(tool => tool.pinned).length}/>
            </div>
        )}
        {tools.length > 0 && (
            <ToolsDataTable data={tools} columns={columns}/>
        )}
        </main>
    )
}