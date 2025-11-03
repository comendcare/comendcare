import {Suspense} from "react"
import PlaceholderCard from "@comend/components/placeholder-card"
import {AdminCompaniesNav} from "~admin/components/admin-companies-nav";
import { FacilityCreateRequestDataTable } from "~admin/components/facility-create-request-data-table/facility-create-request-data-table";

export default async function ProviderCrationRequestCompaniesPage() {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <AdminCompaniesNav/>
            <div className="flex flex-col space-y-6">
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({length: 8}).map((_, i) => (
                                <PlaceholderCard key={i}/>
                            ))}
                        </div>
                    }
                >
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="font-cal text-3xl font-bold dark:text-white">
                                All Provider Creation Requests
                            </h1>
                        </div>
                        <Suspense
                            fallback={
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {Array.from({length: 8}).map((_, i) => (
                                        <PlaceholderCard key={i}/>
                                    ))}
                                </div>
                            }
                        >
                            <FacilityCreateRequestDataTable />
                        </Suspense>
                    </div>
                </Suspense>
            </div>
        </div>
    )
}
