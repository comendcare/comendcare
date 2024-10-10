import prisma from "@/lib/prisma";
import {inviteUser} from "@/app/actions";

export default async function SiteSettingsDomains({
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
            Hi
        </div>
    );
}
