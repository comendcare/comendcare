import { RFP } from "@prisma/client";
import { Separator } from "@comend/components/ui/separator";

export function RFPPage({rfp}: {rfp: RFP | undefined}) {
    if (!rfp) {
        return (
            <>No RFP found. This RFP may not exist or you don't have permission to access it.</>
        )
    }

    return (
        <div>
            <div>
                <h1>{rfp.title || 'Untitled RFP'}</h1>
                <p>{rfp.description}</p>
            </div>
            <Separator />
        </div>
    )
}