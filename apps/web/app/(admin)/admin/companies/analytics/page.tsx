import {Suspense} from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminCompaniesNav} from "@/components/admin-companies-nav";
import {AdminCompaniesAnalyticsCards} from "@/components/admin-companies-analytics-cards";
import {AdminCompaniesAnalyticsChart} from "@/components/admin-companies-analytics-chart";

export default function AdminCompaniesPage() {

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
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <AdminCompaniesAnalyticsCards/>
                        <div className="px-4 lg:px-6">
                            <AdminCompaniesAnalyticsChart/>
                        </div>
                    </div>
                </Suspense>
            </div>
        </div>
    )
}
