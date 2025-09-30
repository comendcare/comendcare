import {getSavedCompaniesFromOrganizationId, getSavedOrganizationsFromOrganizationId} from "@comend/lib/fetchers";
import {columns} from "~web/components/saved-cro-data-table/saved-cros-data-columns";
import {SavedCROsDataTable} from "~web/components/saved-cro-data-table/saved-cros-data-table";
import {SavedCompanyData} from "@comend/lib/types";
import NoOrganization from "~web/components/no-organization";
import {getSession} from "@/packages/lib/auth";

export default async function ServiceProviderSavesPage() {
    const session = await getSession()

    if (!session?.user?.organizationId) return <NoOrganization />

    let savedCompanies: SavedCompanyData[] = []
    if (session?.user.organizationId) {
        const savedCompaniesResponse = await getSavedCompaniesFromOrganizationId(session?.user?.organizationId || undefined, {
            id: true,
            organizationId: true,
            organization: true,
            companyId: true,
            company: true,
            milestoneId: true,
            milestone: true,
            updatedAt: true,
            createdAt: true,
            metadata: true
        });
        if (savedCompaniesResponse.success) {
            savedCompanies = savedCompaniesResponse.data as SavedCompanyData[];
        } else {
            console.error(savedCompaniesResponse.error);
        }
    }

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
            {/* {savedCompanies.length === 0 ?
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="No service providers saved"
                        src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                        width={300}
                        height={300}
                        className="dark:hidden"
                    />
                    <Image
                        alt="No service providers saved"
                        src="https://illustrations.popsy.co/white/digital-nomad.svg"
                        width={300}
                        height={300}
                        className="hidden dark:block"
                    />
                    <div className="flex flex-col justify-center items-center space-y-8">
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            {`You do not have any saved service providers yet. Visit the marketplace to save some service providers.`}
                        </p>
                        <PulsatingButton
                            className="bg-black"
                            pulseColor={"#9ca3af"}
                            onClick={() => router.push("/app/marketplace/service-providers")}
                        >
                            Visit marketplace
                        </PulsatingButton>
                    </div>
                </div>
                : */}
                <SavedCROsDataTable data={savedCompanies} columns={columns}/>
            {/* } */}
        </main>
    )
}
