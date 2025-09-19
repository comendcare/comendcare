import NoOrganization from "~web/components/no-organization";
import { getSavedOrganizationsFromOrganizationId } from "@comend/lib/fetchers";
import { SavedOrganizationsDataTable } from "~web/components/saved-organization-data-table/saved-organizations-data-table";
import { columns } from "~web/components/saved-organization-data-table/saved-organizations-data-columns";
import { SavedOrganizationData } from "@/packages/lib/types";
import {getSession} from "@/packages/lib/auth";

export default async function OrganizationSavesPage() {
    const session = await getSession()

    if (!session?.user?.organizationId) return <NoOrganization />

    let savedOrganizations: SavedOrganizationData[] = []
    if (session?.user.organizationId) {
        const savedOrganizationsResponse = await getSavedOrganizationsFromOrganizationId(session?.user?.organizationId || undefined, {
            id: true,
            organizationId: true,
            organization: true,
            savedOrganizationId: true,
            savedOrganization: true,
            updatedAt: true,
            createdAt: true,
            metadata: true
        });
        if (savedOrganizationsResponse.success) {
            savedOrganizations = savedOrganizationsResponse.data as SavedOrganizationData[];
        } else {
            console.error(savedOrganizationsResponse.error);
        }
    }

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
            {/* {savedOrganizations.length === 0 ?
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="No patient groups shortlisted"
                        src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                        width={300}
                        height={300}
                        className="dark:hidden"
                    />
                    <Image
                        alt="No patient groups shortlisted"
                        src="https://illustrations.popsy.co/white/digital-nomad.svg"
                        width={300}
                        height={300}
                        className="hidden dark:block"
                    />
                    <div className="flex flex-col justify-center items-center space-y-8">
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            {`You do not have any shortlisted patient groups yet. Visit the marketplace to save some patient groups.`}
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
                <SavedOrganizationsDataTable data={savedOrganizations} columns={columns}/>
            {/* } */}
        </main>
    )
}
