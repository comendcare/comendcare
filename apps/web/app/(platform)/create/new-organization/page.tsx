import {Option} from "@comend/lib/types";
import {
    getInvitations,
    getPublicOrganizationData,
    getAllNonMemberOrganizations,
} from "@comend/lib/fetchers";
import {Separator} from "@comend/components/ui/separator";
import NewOrganizationForm from "~web/components/new-organization-form";

export default async function CreateNewOrganizationPage() {

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

    // Organizations (for joining)
    let organizations: Option[] = [];
    const orgsRes = await getAllNonMemberOrganizations({id: true, name: true, description: true});
    if (orgsRes.success && orgsRes.data) {
        organizations = orgsRes.data.map((org: any, idx: number) => ({
            value: org.id || String(idx),
            label: org.name || "",
            description: org.description || "",
        }));
    }

    return (
        <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-8 px-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Create a new organization
                </h1>
                <p className="text-sm text-muted-foreground">
                    One simple form. We’ll use your answers to set up your profile, organization, condition, and finances.
                </p>
            </div>
            <Separator/>
            <NewOrganizationForm
                invitations={invitations}
                organizations={organizations}
            />
        </div>
    );
}
