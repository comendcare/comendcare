import {Suspense} from "react"
import PlaceholderCard from "@comend/components/placeholder-card"
import {AdminCompaniesNav} from "~admin/components/admin-companies-nav";
import {AdminCompaniesAnalyticsCards} from "~admin/components/admin-companies-analytics-cards";
import {AdminCompaniesAnalyticsChart} from "~admin/components/admin-companies-analytics-chart";
import {
    ProviderContactRequestDialog
} from "~admin/components/provider-contact-request-data-table/provider-contact-request-dialog";
import {
    ProviderContactRequestDataTable
} from "~admin/components/provider-contact-request-data-table/provider-contact-request-data-table";

export default function ProviderContactRequestCompaniesPage() {

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
                                All Provider Contact Requests
                            </h1>
                            <ProviderContactRequestDialog />
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
                            <ProviderContactRequestDataTable />
                        </Suspense>
                    </div>
                </Suspense>
            </div>
        </div>
    )
}
