import { ProfilePhoto } from "@/components/profile-photo"
import { getOrganizationData, getPublicRoadmapsForOrganization } from "@/lib/fetchers"
import { cn, formatMoney, standardizeYear } from "@/lib/utils"
import { Building2, Calendar, HandCoins } from "lucide-react"
import { notFound } from "next/navigation"
import Image from "next/image"
import { PublicMilestoneDetails } from "@/components/public-milestone-details"
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default async function EmbeddedProjectPage({params}: {params: {domain: string, researchPlanId: string, projectId: string}}) {
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(params.domain, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
        }),
        getPublicRoadmapsForOrganization(params.domain, {
                id: true,
                title: true,
                description: true,
                slug: true,
                edges: true,
                milestones: true,
                nodes: true,
                modalities: true
            }),
    ])

    if (!organization) {
        notFound()
    }

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.researchPlanId)
    const milestone = roadmap?.milestones.find(milestone => milestone.id === params.projectId)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank">
                                            {organization.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan`} target="_blank">
                                            Research Plans
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${params.researchPlanId}`} target="_blank">
                                            {roadmap?.title || 'Untitled Research Plan'}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`http://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${params.researchPlanId}?project=${params.projectId}`} target="_blank">
                                            {milestone?.title || 'Untitled Project'}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>   
                                </BreadcrumbList>
                            </Breadcrumb>
                            <PAGRoadmapHeader organization={organization} editable={false} embedded={true}/>
                            <PublicMilestoneDetails 
                                roadmap={roadmap}
                                urlMilestone={milestone?.id || null}
                            />
                        </div>
                    </>
                ) :
                (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/gray/success.svg"
                            width={400}
                            height={400}
                            className="dark:hidden"
                        />
                        <Image
                            alt="missing roadmap"
                            src="https://illustrations.popsy.co/white/success.svg"
                            width={400}
                            height={400}
                            className="hidden dark:block"
                        />
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            No roadmaps yet.
                        </p>
                    </div>
                )
            }
        </>
    )
}