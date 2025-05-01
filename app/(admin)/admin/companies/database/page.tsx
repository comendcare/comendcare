import { Suspense } from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminCompaniesAnalyticsCards} from "@/components/admin-companies-analytics-cards";
import CROSearchBar from "@/components/cro-searchbar";
import {CROSearchResults} from "@/components/cro-search-results";
import {CreateCompanyDialog} from "@/components/create-company-dialog";
import {AdminCompaniesNav} from "@/components/admin-companies-nav";

export default function AdminCompaniesPage() {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <AdminCompaniesNav/>
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Companies
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
                    <CROSearchResults />
                </Suspense>
            </div>
        </div>
    )
}
