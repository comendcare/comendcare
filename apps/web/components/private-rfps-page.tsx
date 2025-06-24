"use client"

import Image from "next/image"
import { useShallow } from "zustand/react/shallow"
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore"
import { EditRFPDialog, NewRFPDialog } from "./edit-rfp-dialog"
import { RFPBulkImportDialog } from "./rfp-bulk-import-dialog"
import { RFPCard } from "./rfp-card"

const rfpSelector = (state: RFPState) => ({
    rfps: state.rfps
})

export const PrivateRFPsPage = () => {
    const { rfps } = useRFPStore(useShallow(rfpSelector))

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl p-4 h-full items-center mx-auto">
            <div className="flex gap-2 w-full justify-end">
                <NewRFPDialog iconOnly={true} numRFPsPinned={rfps.filter(rfp => rfp.pinned).length}/>
                <RFPBulkImportDialog />
            </div>

            {rfps.length <= 0 && (
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any RFPs</h1>
                    <Image
                        alt="No RFPs"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                    <p className="text-lg text-stone-500">
                        An RFP is a milestone you want to support through funding and/or other resources. 
                    </p>
                    <NewRFPDialog numRFPsPinned={rfps.filter(rfp => rfp.pinned).length}/>
                </div>
            )}
            {rfps.length > 0 && (
                <div className={"w-full grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"}>
                    {rfps.map((rfp) => (
                        <EditRFPDialog key={rfp.id} data={rfp} numRFPsPinned={rfps.filter(rfp => rfp.pinned).length}>
                            <RFPCard rfp={rfp} isPrivate={true}/>
                        </EditRFPDialog>
                    ))}
                </div>
            )}

        </main>
    )
}
