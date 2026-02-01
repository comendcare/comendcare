import {Option} from "@comend/lib/types";
import {
    getInvitations,
    getPublicOrganizationData,
    getAllNonMemberOrganizations,
    getOrganizationFromOrganizationId,
} from "@comend/lib/fetchers";
import {Separator} from "@comend/components/ui/separator";
import NewOrganizationForm from "~web/components/new-organization-form";
import AgentCreateOrganization from "@comend/components/agent-create-organization";

export default async function CreateNewOrganizationPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    // Kick off both in parallel (independent)
    const invResPromise = getInvitations({
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accepted: true,
        organizationId: true,
    });

    const orgsResPromise = getAllNonMemberOrganizations({id: true, name: true, description: true});

    const [invRes, orgsRes] = await Promise.all([invResPromise, orgsResPromise]);

    let invitations = []
    if (invRes.success && invRes.data) {
        // Deduplicate org fetches by organizationId
        const orgIds = Array.from(new Set(invRes.data.map((i: any) => i.organizationId).filter(Boolean)));

        const orgEntries = await Promise.all(
            orgIds.map(async (orgId: string) => {
                const orgRes = await getPublicOrganizationData(orgId, {
                    id: true,
                    name: true,
                    description: true,
                    image: true,
                    subdomain: true,
                });
                return [orgId, orgRes.success ? orgRes.data : null] as const;
            })
        );

        const orgById = new Map(orgEntries);

        invitations = invRes.data.map((i: any) => ({
            ...i,
            organization: orgById.get(i.organizationId) ?? null
        }));
    }

    // Organizations (for joining)
    let organizations: Option[] = [];
    if (orgsRes.success && orgsRes.data) {
        organizations = orgsRes.data.map((org: any, idx: number) => ({
            value: org.id || String(idx),
            label: org.name || "",
            description: org.description || "",
        }));
    }

    let organization = undefined
    const orgId: string | undefined = typeof searchParams.id === 'string' ? searchParams.id : undefined
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
        })
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

            <AgentCreateOrganization />

            <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-border" />
                <span className="mx-4 text-sm font-semibold text-muted-foreground uppercase">
                    OR
                </span>
                <div className="flex-grow border-t border-border" />
            </div>

            <NewOrganizationForm
                invitations={invitations}
                organizations={organizations}
            />
        </div>
    );
}
