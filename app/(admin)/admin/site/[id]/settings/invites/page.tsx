import prisma from "@/lib/prisma";
import {updateSite} from "@/lib/actions";
import InvitationForm from "@/components/invitation-form";

export default async function SiteSettingsAppearance({
                                                         params,
                                                     }: {
    params: { id: string };
}) {
    const data = await prisma.site.findUnique({
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
