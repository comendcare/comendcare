import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import {getRoadmapsForOrganization, getOrganizationData, getConditionsDataFromOrgId, getCROData} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {RoadmapCard} from "@/components/public-roadmap-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import {PAGProfileAssetsAndRFPsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import Link from "next/link";
import {FaArrowLeftLong} from "react-icons/fa6";

export async function generateStaticParams() { const allOrganizations = await prisma.organization.findMany({
        select: {
            subdomain: true,
            customDomain: true
        }
        // feel free to remove this filter if you want to generate paths for all organizations
        // where: {
        //     subdomain: "demo",
        // },
    })

    const allPaths = allOrganizations
        .flatMap(({subdomain, customDomain}) => [
            subdomain && {
                domain: `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            },
            customDomain && {
                domain: customDomain
            }
        ])
        .filter(Boolean)
    return allPaths
}

export default async function OrganizationHomePage({
                                                       params
                                                   }: {
    params: { id: string }
}) {
    const id = decodeURIComponent(params.id)
    const cro = await getCROData(id)

    if (!cro) {
        notFound()
    }

    return (
        <div
            className="flex flex-col w-full max-w-7xl mx-auto p-4 gap-4"
        >
            <Link
                href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/marketplace/patient-groups`
                        : `http://localhost:3000/app/marketplace/patient-groups`
                }
                className="inline-flex items-center gap-x-2 hover:underline"
            >
                <FaArrowLeftLong/>
                Back to marketplace
            </Link>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto">

            </main>

        </div>
    )
}
