import prisma from "@/lib/prisma";
import InvitationForm from "@/components/invitation-form";

export default async function SiteSettingsAppearance({
                                                         params,
                                                     }: {
    params: { id: string };
}) {
    const data = await prisma.organization.findUnique({
        where: {
            id: decodeURIComponent(params.id),
        },
    });

    return (
        <div className="flex flex-col space-y-6 text-white">
            <InvitationForm />
        </div>
    );
}
