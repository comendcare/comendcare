import Image from "next/image"
import { DataRequestDataTable, columns } from "~web/components/data-request-data-table/data-request-data-table"

export default async function DataRequestsPage() {
    // TODOL fetch data requests here...
    const requests = []

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
            {requests.length <= 0 && (
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any Data Requests</h1>
                    <Image
                        alt="No Data Requests"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                </div>
            )}
            {requests.length > 0 && <DataRequestDataTable data={[]} columns={columns} />}
        </main>
    )
}