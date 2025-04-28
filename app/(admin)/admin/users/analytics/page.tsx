import {Suspense} from "react"
import Organizations from "@/components/organizations"
import PlaceholderCard from "@/components/placeholder-card"
import CreateOrganizationButton from "@/components/create-organization-button"
import CreateOrganizationModal from "@/components/modal/create-organization"
import {AdminUsersNav} from "@/components/admin-users-nav";
import {AdminUsersAnalyticsCards} from "@/components/admin-users-analytics-cards";
import {AdminUsersAnalyticsChart} from "@/components/admin-users-analytics-chart";
import prisma from "@/lib/prisma"

export default function AdminUsersAnalyticsPage() {

    const users = prisma.user.findMany()
    console.log(users)

    return (
        <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <AdminUsersNav/>
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
