import { ProfilePhoto } from "@/components/profile-photo";
import { RoadmapsCard } from "@/components/public-roadmap-card";
import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers";
import { formatMoney, standardizeYear } from "@/lib/utils";
import { Building2, Calendar, HandCoins } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EmbeddedResearchPlansPage({params}: {params: {domain: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain),
        getPublicRoadmapsForOrganization(params.domain),
    ])

    if (!organization) {
        notFound()
    }
    
    return (
        <div
            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
        >
            <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start">
                    <ProfilePhoto
                        img={organization.image}
                        name={organization.name}
                        className="h-16 w-16 rounded-full"
                        textSize="small"
                        editable={false}
                    />
                <div className="flex flex-col">
                    <div className="flex gap-4 justify-between">
                        <h1 className="text-wrap text-2xl md:text-3xl font-semibold">
                            {organization?.name}
                        </h1>
                    </div>
                    <div className="w-full flex flex-wrap gap-x-6">
                        {organization?.moneyRaised !== null && organization?.moneyRaised > 0 &&
                            <div className="mt-2 flex items-center text-gray-500">
                                <HandCoins
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"
                                />
                                {formatMoney(organization?.moneyRaised)} raised
                            </div>
                        }
                        {organization?.yearFounded && (
                            <div className="mt-2 flex items-center text-gray-500">
                                <Calendar
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"/>
                                Founded
                                in {standardizeYear(organization?.yearFounded ?? "")}
                            </div>
                        )}
                        {organization?.incorporationStatus === "YES" &&
                            <div className="mt-2 flex items-center text-gray-500">
                                <Building2
                                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                    aria-hidden="true"/>
                                {`501(c)(3)`}
                            </div>
                        }
                    </div>
                </div>
            </div>

            <RoadmapsCard roadmaps={roadmaps} organization={organization}/>
        </div>
    )
}