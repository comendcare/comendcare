import {Option} from "@comend/lib/types";
import {
    getInvitations,
    getPublicOrganizationData,
    getAllNonMemberOrganizations,
    getOrganizationFromOrganizationId,
} from "@comend/lib/fetchers";
import {Separator} from "@comend/components/ui/separator";
import ClaimOrganizationForm from "~web/components/claim-organization-form";

export default async function CreateNewOrganizationPage({
    params
}: {
    params: { id: string }
}) {
    /* TODO - add authentication check to see if this user has been invited to claim this organization */

    // Invitations (to decide where to redirect after user update)
    const invRes = await getInvitations({
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accepted: true,
        organizationId: true,
    });

    let invitations = []
    if (invRes.success && invRes.data) {
        invitations = await Promise.all(
            invRes.data.map(async (i: any) => {
                const orgRes = await getPublicOrganizationData(i.organizationId, {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    subdomain: true,
                });
                return {...i, organization: orgRes.success ? orgRes.data : null};
            })
        );
    }

    let organization = undefined
    const orgId: string | undefined = typeof params.id === 'string' ? params.id : undefined
    if (orgId) {
        organization = await getOrganizationFromOrganizationId(orgId, {
            id: true,
            description: true,
            name: true,
            yearFounded: true,
            contactEmail: true,
            subdomain: true,
            incorporationStatus: true,
            website: true,
            therapeuticsInDevelopment: true,
            therapeuticsOfInterest: true,
            metadata: true,
            image: true,
            conditions: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
        })
    }


    return (
        <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-8 px-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Claim organization
                </h1>
                <p className="text-sm text-muted-foreground">
                    One simple form. We’ll use your answers to set up your profile, organization, condition, and finances.
                </p>
            </div>
            <Separator/>
            <ClaimOrganizationForm
                organization={organization?.data}
                invitations={invitations}
            />
        </div>
    );
}
