import {notFound} from "next/navigation"
import {getOrganizationData, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import Image from "next/image"
import PAGPublicRoadmapBreadcrumb from "@/components/pag-public-roadmap-breadcrumb";
import React from "react";
import { PublicRoadmapContent } from "@/components/public-roadmap-content"
import { PAGRoadmapHeader } from "@/components/pag-roadmap-header"

// export async function generateMetadata({
//                                            params
//                                        }: {
//     params: { domain: string; slug: string }
// }) {
//     const domain = decodeURIComponent(params.domain)
//     const slug = decodeURIComponent(params.slug)

//     const organizationData = await getOrganizationData(domain)

//     // Fallback to avoid passing null to title or description
//     const title = organizationData?.name || "Default Title" // Use a fallback title
//     const description = organizationData?.description || "Default description" // Use a fallback description

//     if (!organizationData) {
//         return {
//             title: "Page Not Found",
//             description: "The page you are looking for does not exist."
//         }
//     }

//     return {
//         title,
//         description,
//         openGraph: {
//             title: title || undefined, // Ensure it's not null
//             description: description || undefined // Ensure it's not null
//         },
//         twitter: {
//             card: "summary_large_image",
//             title: title || undefined, // Ensure it's not null
//             description: description || undefined, // Ensure it's not null
//             creator: "@vercel"
//         },
//         ...(organizationData.customDomain && {
//             alternates: {
//                 canonical: `https://${organizationData.customDomain}/${params.slug}`
//             }
//         })
//     }
// }

// export async function generateStaticParams() {
//     const allRoadmaps = await prisma.roadmap.findMany({
//         select: {
//             slug: true,
//             organization: {
//                 select: {
//                     subdomain: true,
//                     customDomain: true
//                 }
//             }
//         }
//         // feel free to remove this filter if you want to generate paths for all roadmaps
//         // where: {
//         //     organization: {
//         //         subdomain: "demo",
//         //     },
//         // },
//     })

//     const allPaths = allRoadmaps
//         .flatMap(({organization, slug}) => [
//             organization?.subdomain && {
//                 domain: `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
//                 slug
//             },
//             organization?.customDomain && {
//                 domain: organization.customDomain,
//                 slug
//             }
//         ])
//         .filter(Boolean)
//     return allPaths
// }

// const posts: Post[] = [
//     {
//         id: '1',
//         user: {
//             name: 'John Doe',
//             username: '@johndoe',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Just finished a great hike! The view was breathtaking. 🏞️ #NatureLover',
//         image: '/placeholder.png',
//         likes: 120,
//         comments: 18,
//         shares: 5,
//         timestamp: '2 hours ago'
//     },
//     {
//         id: '2',
//         user: {
//             name: 'Jane Smith',
//             username: '@janesmith',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Excited to announce my new project! Stay tuned for more details. 🚀 #NewBeginnings',
//         image: '/placeholder.png',
//         likes: 89,
//         comments: 32,
//         shares: 12,
//         timestamp: '5 hours ago'
//     },
//     {
//         id: '3',
//         user: {
//             name: 'Bob Jackson',
//             username: '@bobby',
//             avatar: '/placeholder.svg?height=40&width=40'
//         },
//         content: 'Hello!. 🚀 #NewBeginnings',
//         image: '/placeholder.png',
//         likes: 29,
//         comments: 32,
//         shares: 1,
//         timestamp: '5 hours ago'
//     }
// ]

export default async function OrganizationRoadmapPage({
                                                          params
                                                      }: {
    params: { domain: string; slug: string; id: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)

    // const data = await getRoadmapData(domain, slug)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain, {
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
        getPublicRoadmapsForOrganization(domain, {
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

    const roadmap = roadmaps.find(roadmap => roadmap.id === params.id)

    return (
        <>
            {roadmap ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center my-24 gap-8 max-w-7xl m-auto w-full text-left p-2"
                        >
                            <PAGPublicRoadmapBreadcrumb
                                organization={organization}
                                roadmap={roadmap}
                            />
                            <PAGRoadmapHeader organization={organization} editable={false} />
                            <PublicRoadmapContent 
                                organization={organization}
                                roadmap={roadmap}
                                subdomain={organization?.subdomain || undefined}
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
