import { Suspense } from "react"
import Organizations from "@/components/organizations"
import PlaceholderCard from "@/components/placeholder-card"
import CreateOrganizationButton from "@/components/create-organization-button"
import CreateOrganizationModal from "@/components/modal/create-organization"
import {AdminOrganizationsNav} from "@/components/admin-organizations-nav";

export default function AllResearchPlans() {
    return (
        <div className="mx-auto flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <AdminOrganizationsNav/>
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Organizations
                    </h1>
                    <CreateOrganizationButton>
                        <CreateOrganizationModal />
                    </CreateOrganizationButton>
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
                    <Organizations
                        // organizationId={decodeURIComponent(params.id)}
                    />
                </Suspense>
            </div>
        </div>
    )
}
