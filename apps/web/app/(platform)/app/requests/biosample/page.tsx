import Image from "next/image"
import { BiosampleRequestDataTable, columns } from "~web/components/biosample-request-data-table/biosample-tool-data-table"

export default async function BiosampleRequestsPage() {
    // TODOL fetch biosample requests here...
    const requests = []

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
            {requests.length <= 0 && (
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any Biosample Requests</h1>
                    <Image
                        alt="No Biosample Requests"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                </div>
            )}
            {requests.length > 0 && <BiosampleRequestDataTable data={[]} columns={columns} />}
        </main>
    )
}