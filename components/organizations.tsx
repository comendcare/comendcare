import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import OrganizationCard from "./organization-card"
import Image from "next/image"

export default async function Organizations({ limit }: { limit?: number }) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    const organizations = await prisma.organization.findMany({
        orderBy: {
            createdAt: "asc"
        },
        ...(limit ? { take: limit } : {})
    })

    return organizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {organizations.map(organizations => (
                <OrganizationCard key={organizations.id} data={organizations} />
            ))}
        </div>
    ) : (
        <div className="mt-20 flex flex-col items-center space-x-4">
            <h1 className="font-cal text-4xl">No Organizations Yet</h1>
            <Image
                alt="missing organizations"
                src="https://illustrations.popsy.co/gray/web-design.svg"
                width={400}
                height={400}
            />
            <p className="text-lg text-stone-500">
                You do not have any organizations yet. Create one to get
                started.
            </p>
        </div>
    )
}
