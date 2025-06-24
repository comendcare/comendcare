import { Suspense } from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminCompaniesAnalyticsCards} from "~admin/components/admin-companies-analytics-cards";
import CROSearchBar from "@/components/cro-searchbar";
import {CreateCompanyDialog} from "~admin/components/create-company-dialog";
import {AdminCompaniesNav} from "~admin/components/admin-companies-nav";
import {AdminCROSearchResults} from "~admin/components/admin-cro-search-results";

export default function AdminCompaniesPage() {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <AdminCompaniesNav/>
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Service Providers
                    </h1>
                    <CreateCompanyDialog/>
                </div>
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <PlaceholderCard key={i} />
                            ))}
                        </div>
                    }
                >
                    <CROSearchBar />
                    <AdminCROSearchResults />
                </Suspense>
            </div>
        </div>
    )
}
