import { Suspense } from "react"
import Organizations from "~admin/components/organizations"
import PlaceholderCard from "@comend/components/placeholder-card"
import CreateOrganizationButton from "~admin/components/create-organization-button"
import CreateOrganizationModal from "@comend/components/modal/create-organization"
import {AdminOrganizationsNav} from "~admin/components/admin-organizations-nav";
import prisma from "@comend/lib/prisma"

export default async function AllOrganizations() {
    const organizations = await prisma.organization.findMany({
        orderBy: {
            createdAt: "desc"
        },
    })

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
                    <Organizations organizations={organizations}/>
                </Suspense>
            </div>
        </div>
    )
}
