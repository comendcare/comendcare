import React, { useEffect } from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { OrganizationSearchResults } from "~web/components/marketplace/patient-groups/organization-search-results";
import OrganizationSearchBar from "~web/components/marketplace/patient-groups/organization-searchbar";
import PAGMarketplaceIntegratedSearchAndFilter from "~web/components/marketplace/patient-groups/pag-marketplace-integrated-search-and-filter";
import { initializeOrganizationSearch } from "@/packages/lib/initialize-client-state";

export default async function PatientGroupsPage() {
    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full">
                <PAGMarketplaceIntegratedSearchAndFilter />
                <OrganizationSearchResults isPublic={false} />
            </div>
        </main>
    )
}
