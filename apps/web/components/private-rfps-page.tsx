import { RFPCard } from "./rfp-card"
import { EditRFPDialog, NewRFPDialog } from "./edit-rfp-dialog"
import Image from "next/image"

type Props = {
    initialRFPs: any[] // or RFP[] if you have the type locally
}

export function PrivateRFPsPage({ initialRFPs }: Props) {

    const renderRfps = initialRFPs

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl p-4 h-full items-center mx-auto">
            <div className="flex gap-2 w-full justify-between items-center">
                <h1 className="text-3xl font-semibold">Requests for Proposals (RFPs)</h1>
                <NewRFPDialog />
            </div>

            {renderRfps.length <= 0 && (
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
                    <NewRFPDialog />
                </div>
            )}

            {renderRfps.length > 0 && (
                <div className="w-full gap-4 flex flex-col">
                    {renderRfps.map((rfp) => (
                        <EditRFPDialog key={rfp.id} data={rfp}>
                            <RFPCard rfp={rfp} isPrivate />
                        </EditRFPDialog>
                    ))}
                </div>
            )}
        </main>
    )
}
