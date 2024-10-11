import prisma from "@/lib/prisma";

export default async function SiteSettingsDomains({
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
            Hi
        </div>
    );
}
