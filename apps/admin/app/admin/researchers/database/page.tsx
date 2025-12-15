import { Suspense } from "react"
import PlaceholderCard from "@comend/components/placeholder-card"
import {CreateCompanyDialog} from "~admin/components/create-company-dialog";
import {AdminCompaniesNav} from "~admin/components/admin-companies-nav";
import {AdminCROSearchResults} from "~admin/components/admin-cro-search-results";
import AdminCROSearchBar from "~admin/components/admin-cro-searchbar";
import { AdminResearcherSearchResults } from "~admin/components/admin-researcher-search-results";
import AdminResearcherSearchBar from "~admin/components/researcher-searchbar";

export default function AdminResearchersDatabasePage() {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                {/* <AdminCompaniesNav/> */}
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Researchers
                    </h1>
                    {/* <CreateCompanyDialog/> */}
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
                    <AdminResearcherSearchBar />
                    <AdminResearcherSearchResults />
                </Suspense>
            </div>
        </div>
    )
}
