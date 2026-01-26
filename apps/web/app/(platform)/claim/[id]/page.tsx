import {Option} from "@comend/lib/types";
import {
    getInvitations,
    getPublicOrganizationData,
    getAllNonMemberOrganizations,
    getOrganizationFromOrganizationId,
} from "@comend/lib/fetchers";
import {Separator} from "@comend/components/ui/separator";
import ClaimOrganizationForm from "~web/components/claim-organization-form";
import prisma from "@comend/lib/prisma";
import { authOptions } from "@comend/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateNewOrganizationPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [memberships] = await Promise.all([
        prisma.member.findMany({
            where: { userId },
            include: {
                organization: true,
                user: true,
                invitedBy: true,
            },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    let organization = undefined
    const orgId: string | undefined = typeof params.id === 'string' ? params.id : undefined

    // if the user is not a member of the org, redirect back to dashboard, user is not allowed to claim this org
    if (orgId && !memberships.map(membership => membership.organizationId).includes(orgId)) {
        redirect("/app/dashboard"); 
    }


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
                membership={memberships.filter(member => (member.userId === session?.user?.id) && (member.organizationId === orgId))?.[0] || undefined}
            />
        </div>
    );
}
