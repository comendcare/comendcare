import {Suspense} from "react"
import PlaceholderCard from "@/components/placeholder-card"
import {AdminUsersNav} from "@/components/admin-users-nav";
import {AdminUsersAnalyticsCards} from "@/components/admin-users-analytics-cards";
import {AdminUsersAnalyticsChart} from "@/components/admin-users-analytics-chart";

export default function AdminUsersAnalyticsPage() {

    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <AdminUsersNav/>
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
                        <AdminUsersAnalyticsCards/>
                        <div className="px-4 lg:px-6">
                            <AdminUsersAnalyticsChart/>
                        </div>
                    </div>
                </Suspense>
            </div>
        </div>
    )
}
