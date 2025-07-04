"use client"

import Image from "next/image"
import { AssetState, useAssetStore } from "@/state/asset/assetStore"
import { useShallow } from "zustand/react/shallow"
import { NewAssetDialog } from "./edit-asset-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { columns } from "./assets-data-table/assets-data-columns";
import { AssetsDataTable } from "./assets-data-table/assets-data-table"
import { useEffect, useState } from "react"
import { Asset } from "@/packages/lib/types"
import { getBiosampleToolTypes, getDataToolTypes } from "@/packages/lib/fetchers"

const toolSelector = (state: AssetState) => ({
    tools: state.tools
})

// const biosampleTypeIds: string[] = ['BIOMARKER', 'OUTCOMEMEASURE', 'BIOBANK', 'PATIENTDERIVEDCELLLINE', 'ENGINEEREDCELLLINE', 'MOUSEMODEL', 'OTHERDISEASEMODEL', 'TARGETVALIDATION', 'ASSAYDEVELOPMENT', 'DRUGSCREEN', 'EFFICASYSTUDY', 'DOSEFINDINGSTUDY', 'TOXICOLOGYSTUDY', 'BIODISTRIBUTIONSTUDY', 'GENETHERAPYPRODUCTION', 'GPMANUFACTURING', 'INTERACTMEETING', 'PREINDMEETING', 'INDSUBMISSION', 'SITESELECTION', 'TRIALDESIGN', 'PHASE1', 'PHASE1/2', 'PHASE2', 'PHASE3', 'FDAAPPROVAL', 'PHASE4']
// const dataTypeIds: string[] = ['BASICSCIENCE', 'FUNCTIONALSTUDY', 'NATURALHISTORYSTUDY', 'PATIENTREGISTRY', 'PATIENTRECRUITMENT']

async function filterTools(tools: Asset[], type: 'biosample' | 'data') {
    switch (type) {
        case 'biosample':
            const biosampleTypes = await getBiosampleToolTypes({
                id: true, 
                type: true
            }) 
            if (biosampleTypes.success && biosampleTypes.data) {
                return tools.filter(tool => biosampleTypes.data.some(t => tool.types.includes(t.id)))
            }
            break;
        case 'data':
            const dataTypes = await getDataToolTypes({
                id: true, 
                type: true
            }) 
            if (dataTypes.success && dataTypes.data) {
                return tools.filter(tool => dataTypes.data.some(t => tool.types.includes(t.id)))
            }
            break;
        default:
            return tools
    }

    return []
}

export const PrivateAssetsPage = ({type}: {type: 'biosample' | 'data'}) => {
    const { tools } = useAssetStore(useShallow(toolSelector))
    const [filteredTools, setFilteredTools] = useState<Asset[]>([])

    useEffect(() => {
        const init = async () => {
            const filtered: Asset[] = await filterTools(tools, type)
            setFilteredTools(filtered)
        }
        init()
    }, [tools])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewAssetDialog iconOnly={true} numAssetsPinned={filteredTools.filter(tool => tool.pinned).length} type={type}/>
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
                    A tool is a milestone outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                </p>
                <NewAssetDialog numAssetsPinned={tools.filter(tool => tool.pinned).length} type={type}/>
            </div>
        )}
        {filteredTools.length > 0 && (
            <AssetsDataTable data={filteredTools} columns={columns} type={type}/>
        )}
        </main>
    )
}
