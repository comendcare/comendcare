import React from "react";
import {notFound} from "next/navigation"
import prisma from "@/lib/prisma"
import {getOrganizationData, getPublicRoadmapsForOrganization} from "@/lib/fetchers"
import {formatMoney, standardizeYear} from "@/lib/utils"
import Image from "next/image"
import {Button} from "@/components/ui/button"
import {ProfilePhoto} from "@/components/profile-photo";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Post} from "@/app/condition/[slug]/page";
import {FloatingDock} from "@/components/floating-dock";
import {IconFlag, IconShare} from "@tabler/icons-react";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import ShareDialog from "@/components/share-dialog";
import {PublicRoadmapContent} from "@/components/public-roadmap-content";
import MarketplaceBreadcrumb from "@/components/marketplace-breadcrumb";
import { Building2, Calendar, HandCoins, PencilIcon } from "lucide-react";
import ContactPAGDialog from "@/components/contact-pag-dialog";

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const slug = decodeURIComponent(params.slug)

    const organizationData = await getOrganizationData(domain)

    // Fallback to avoid passing null to title or description
    const title = organizationData?.name || "Default Title" // Use a fallback title
    const description = organizationData?.description || "Default description" // Use a fallback description

    console.log("organizationData", organizationData)
    if (!organizationData) {
        return {
            title: "Page Not Found",
            description: "The page you are looking for does not exist."
        }
    }

    return {
        title,
        description,
        openGraph: {
            title: title || undefined, // Ensure it's not null
            description: description || undefined // Ensure it's not null
        },
        twitter: {
            card: "summary_large_image",
            title: title || undefined, // Ensure it's not null
            description: description || undefined, // Ensure it's not null
            creator: "@vercel"
        },
        ...(organizationData.customDomain && {
            alternates: {
                canonical: `https://${organizationData.customDomain}/${params.slug}`
            }
        })
    }
}

export async function generateStaticParams() {
    const allRoadmaps = await prisma.roadmap.findMany({
        select: {
            slug: true,
            organization: {
                select: {
                    subdomain: true,
                    customDomain: true
                }
            }
        }
        // feel free to remove this filter if you want to generate paths for all roadmaps
        // where: {
        //     organization: {
        //         subdomain: "demo",
        //     },
        // },
    })

    const allPaths = allRoadmaps
        .flatMap(({organization, slug}) => [
            organization?.subdomain && {
                domain: `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
                slug
            },
            organization?.customDomain && {
                domain: organization.customDomain,
                slug
            }
        ])
        .filter(Boolean)
    return allPaths
}

const posts: Post[] = [
    {
        id: '1',
        user: {
            name: 'John Doe',
            username: '@johndoe',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Just finished a great hike! The view was breathtaking. 🏞️ #NatureLover',
        image: '/placeholder.png',
        likes: 120,
        comments: 18,
        shares: 5,
        timestamp: '2 hours ago'
    },
    {
        id: '2',
        user: {
            name: 'Jane Smith',
            username: '@janesmith',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Excited to announce my new project! Stay tuned for more details. 🚀 #NewBeginnings',
        image: '/placeholder.png',
        likes: 89,
        comments: 32,
        shares: 12,
        timestamp: '5 hours ago'
    },
    {
        id: '3',
        user: {
            name: 'Bob Jackson',
            username: '@bobby',
            avatar: '/placeholder.svg?height=40&width=40'
        },
        content: 'Hello!. 🚀 #NewBeginnings',
        image: '/placeholder.png',
        likes: 29,
        comments: 32,
        shares: 1,
        timestamp: '5 hours ago'
    }
]

export default async function OrganizationRoadmapPage({
                                                          params
                                                      }: {
    params: { domain: string; slug: string }
}) {
    const domain = decodeURIComponent(params.domain)

    // const data = await getRoadmapData(domain, slug)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain),
        getPublicRoadmapsForOrganization(domain),
    ])

    if (!organization) {
        notFound()
    }

    return (
        <>
            {roadmaps.length > 0 ? (
                    <>
                        <div
                            className="flex flex-col items-start justify-center gap-4 max-w-7xl mx-auto w-full text-left p-4"
                        >
                            <MarketplaceBreadcrumb
                                organization={organization}
                                roadmap={roadmaps[0]}
                                marketplaceDomain={"/app/marketplace/milestones"}
                            />

                            {/*<h1 className="min-w-0 flex-1 truncate text-4xl font-bold text-gray-900">*/}
                            {/*    {roadmaps[0].title}*/}
                            {/*</h1>*/}

                            <div className="w-full flex flex-col md:flex-row items-center justify-between space-y-4 md:space-x-4">

                                <ProfilePhoto
                                    img={organization?.image}
                                    name={organization?.name}
                                    className="rounded-full ring-4 ring-white h-16 w-16"
                                    textSize="medium"
                                />

                                <div
                                    className="flex min-w-0 flex-1 items-center justify-center space-x-6 pb-1"
                                >
                                    <div className="min-w-0 flex-1 sm:hidden md:block">
                                        <div className="min-w-0 flex-1 text-4xl font-bold text-gray-900">
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <h1 className="text-wrap md:truncate  cursor-pointer">
                                                        {`${organization?.name}'s Research Plan`}
                                                    </h1>
                                                </HoverCardTrigger>
                                                <HoverCardContent
                                                    side="top"
                                                    className="w-fit"
                                                >
                                                    <div className="space-y-2">
                                                        <h4 className="text-lg font-semibold">
                                                            {organization?.name}
                                                        </h4>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                        <div
                                            className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
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
                                                    <Calendar className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                                aria-hidden="true"/>
                                                    Founded in {standardizeYear(organization?.yearFounded ?? "")}
                                                </div>
                                            )}
                                            {organization?.incorporationStatus === "YES" &&
                                                <div className="mt-2 flex items-center text-gray-500">
                                                    <Building2 className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                                            aria-hidden="true"/>
                                                    {`501(c)(3)`}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/*<div*/}
                                {/*    className="flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">*/}
                                {/*    <div className="flex flex-row space-x-2">*/}
                                {/*        <Button*/}
                                {/*            className="gap-x-2"*/}
                                {/*        >*/}
                                {/*            <FaPlus/>*/}
                                {/*            Follow*/}
                                {/*        </Button>*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                            </div>

                            <p>
                                {roadmaps[0].description}
                            </p>

                            <PublicRoadmapContent
                                roadmap={roadmaps[0]}
                                subdomain={organization?.subdomain || undefined}
                            />

                            {/*<div className="mt-8 w-full space-y-8">*/}
                            {/*    <h2 className="text-center text-3xl md:text-4xl font-bold">*/}
                            {/*        Recent activity*/}
                            {/*    </h2>*/}
                            {/*    <Carousel>*/}
                            {/*        <CarouselContent className="p-4 gap-4">*/}
                            {/*            {posts.map((post, index) => (*/}
                            {/*                <ConditionProfileRecentActivityCard post={post} key={index}/>*/}
                            {/*            ))}*/}
                            {/*        </CarouselContent>*/}
                            {/*        <CarouselPrevious/>*/}
                            {/*        <CarouselNext/>*/}
                            {/*    </Carousel>*/}
                            {/*</div>*/}
                        </div>

                        <FloatingDock
                            items={[
                                // {
                                //     title: "Post on feed",
                                //     icon: <IconShare2/>,
                                //     href: "/app/feed",
                                // },
                                {
                                    title: "Share on social media",
                                    icon: <IconShare/>,
                                    dialog: <ShareDialog
                                        url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${roadmaps[0].id}`}/>
                                },
                                {
                                    title: "Contact patient group",
                                    icon: <PencilIcon/>,
                                    dialog: <ContactPAGDialog organization={organization}/>
                                },
                                // {
                                //     title: "Report an issue",
                                //     icon: <IconFlag/>,
                                //     dialog: (
                                //         <>
                                //             <DialogHeader>
                                //                 <DialogTitle>Edit profile</DialogTitle>
                                //                 <DialogDescription>
                                //                     {`Make changes to your profile here. Click save when you're done.`}
                                //                 </DialogDescription>
                                //             </DialogHeader>
                                //             <div className="grid gap-4 py-4">
                                //                 <Label htmlFor="name">Name</Label>
                                //                 <Input id="name" defaultValue="John Doe"/>
                                //             </div>
                                //             <DialogFooter>
                                //                 <Button type="submit">Save changes</Button>
                                //             </DialogFooter>
                                //         </>
                                //     ),
                                // }
                            ]}
                            orientation="vertical"
                            desktopClassName="right-4"
                        />
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
