import Link from "next/link"
import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import BlurImage from "@/components/blur-image"
import {cn, placeholderBlurhash, toDateString} from "@/lib/utils"
import BlogCard from "@/components/blog-card"
import {getRoadmapsForOrganization, getOrganizationData, getConditionsDataFromOrgId} from "@/lib/fetchers"
import Image from "next/image"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {PAGProfileResearchPlanCard} from "@/components/pag-profile-research-plan-card";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {UserNewPostCard} from "@/components/user-new-post-card";
import {UserFeedTextCard} from "@/components/user-feed-text-card";
import {PAGPublicProfileDetailsCard} from "@/components/pag-public-profile-details-card";
import { PublicRoadmap } from "@/components/public-roadmap";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {CalendarDays} from "lucide-react";
import {PAGProfileAssetsCard} from "@/components/pag-profile-assets-card";
import {PAGProfileOpenRFPsCard} from "@/components/pag-profile-open-rfps-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PAGProfileAssetsAndProjectsHoverableCard} from "@/components/pag-profile-assets-and-projects-hoverable-card";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import CTASection from "@/components/layout/sections/cta";
import PublicPageFooter from "@/components/public-page-footer";

export async function generateStaticParams() {
    const allOrganizations = await prisma.organization.findMany({
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
    params: { domain: string }
}) {
    const domain = decodeURIComponent(params.domain)
    const [organization, roadmaps] = await Promise.all([
        getOrganizationData(domain),
        getRoadmapsForOrganization(domain)
    ])

    if (!organization) {
        notFound()
    }

    let dbMilestones = []
    dbMilestones = await prisma.milestone.findMany({
        where: {roadmapId: organization.roadmaps?.[0].id},
        include: {
            papers: true,
            asset: {
                include: {contacts: true, attachments: true}
            },
            RFP: {
                include: {contacts: true, attachments: true}
            },
            tasks: {
                orderBy: {orderPosition: 'asc'},
                include: {
                    checklist: {orderBy: {orderPosition: 'asc'}}
                }
            }
        }
    })

    let conditions = null
    if (organization) {
        const response = await getConditionsDataFromOrgId(organization.id)
        if (response.success) {
            conditions = response.data
        } else {
            console.error(response.error)
        }
    }

    return (
        <>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto mt-16 gap-4">
                <div className="col-span-8 flex flex-col items-center space-y-8">
                    <PAGPublicProfileHeader organization={organization}/>

                    <div className="grid grid-cols-6 gap-4">
                        <div className="relative col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PagProfileAboutCard organization={organization}/>
                                <PAGProfileConditionsCard conditions={conditions}/>
                            </div>
                            {/*<PAGProfileAssetsCard/>*/}
                            {/*<PAGProfileOpenRFPsCard/>*/}
                        </div>

                    <div className="col-span-4 flex flex-col space-y-4">
                        {roadmaps.length > 0 &&
                            <PublicRoadmap roadmap={roadmaps[0]}/>
                        }
                        <Card>
                            <CardHeader>
                                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                                    Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <UserNewPostCard/>
                                <UserFeedTextCard
                                    content={"Some patients with LGMD2I or MDC1C have trouble with their breathing. To support their breathing, they get a ventilation device that they either use full-time, i.e. 24 hours a day, or only for several hours a day or at night. “Non-invasive” means that they use this device without having had an operation. Usually this means they wear a mask that can be removed at any time."}
                                />
                                <UserFeedTextCard
                                    content={"I'm wondering if this applies to me? I can move unassisted but not without a lot of stiffness."}
                                    blockquote={"Motor function describes a person’s ability to move his or her body. Sitting independently means that you can stay in the sitting position for several minutes, without being supported by either another position or stabilizing device (chair back, corset or brace)." +
                                        "- I am able to run " +
                                        "- I am currently able to climb stairs without assistance"}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {roadmaps?.length > 1 && (
                    <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">
                        <h2 className="mb-10 font-title text-4xl dark:text-white md:text-5xl">
                            More stories
                        </h2>
                        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                            {roadmaps
                                .slice(1)
                                .map((metadata: any, index: number) => (
                                    <BlogCard key={index} data={metadata}/>
                                ))}
                        </div>
                    </div>

                    {/*<div className="w-full">*/}
                    {/*    {roadmaps.length > 0 ? (*/}
                    {/*        <div className="mx-auto w-full max-w-screen-xl md:mb-28 lg:w-5/6">*/}
                    {/*            <Link href={`/${roadmaps[0]?.slug}`}>*/}
                    {/*                <div*/}
                    {/*                    className="group relative mx-auto h-80 w-full overflow-hidden sm:h-150 lg:rounded-xl">*/}
                    {/*                    <BlurImage*/}
                    {/*                        alt={roadmaps[0]?.title ?? ""}*/}
                    {/*                        blurDataURL={*/}
                    {/*                            roadmaps[0]?.imageBlurhash ??*/}
                    {/*                            placeholderBlurhash*/}
                    {/*                        }*/}
                    {/*                        className="h-full w-full object-cover group-hover:scale-105 group-hover:duration-300"*/}
                    {/*                        width={1300}*/}
                    {/*                        height={630}*/}
                    {/*                        placeholder="blur"*/}
                    {/*                        src={*/}
                    {/*                            roadmaps[0]?.image ?? "/placeholder.png"*/}
                    {/*                        }*/}
                    {/*                    />*/}
                    {/*                </div>*/}
                    {/*                <div className="mx-auto mt-10 w-5/6 lg:w-full">*/}
                    {/*                    <h2 className="my-10 font-title text-4xl dark:text-white md:text-6xl">*/}
                    {/*                        {roadmaps[0]?.title}*/}
                    {/*                    </h2>*/}
                    {/*                    <p className="w-full text-base dark:text-white md:text-lg lg:w-2/3">*/}
                    {/*                        {roadmaps[0]?.description}*/}
                    {/*                    </p>*/}
                    {/*                    <div className="flex w-full items-center justify-start space-x-4">*/}
                    {/*                        <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">*/}
                    {/*                            {organization.user?.image ? (*/}
                    {/*                                <BlurImage*/}
                    {/*                                    alt={*/}
                    {/*                                        organization.user?.name ??*/}
                    {/*                                        "User Avatar"*/}
                    {/*                                    }*/}
                    {/*                                    width={100}*/}
                    {/*                                    height={100}*/}
                    {/*                                    className="h-full w-full object-cover"*/}
                    {/*                                    src={organization.user?.image}*/}
                    {/*                                />*/}
                    {/*                            ) : (*/}
                    {/*                                <div*/}
                    {/*                                    className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">*/}
                    {/*                                    ?*/}
                    {/*                                </div>*/}
                    {/*                            )}*/}
                    {/*                        </div>*/}
                    {/*                        <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold dark:text-white md:text-base">*/}
                    {/*                            {organization.user?.name}*/}
                    {/*                        </p>*/}
                    {/*                        <div className="h-6 border-l border-stone-600 dark:border-stone-400"/>*/}
                    {/*                        <p className="m-auto my-5 w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">*/}
                    {/*                            {toDateString(roadmaps[0]?.createdAt)}*/}
                    {/*                        </p>*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            </Link>*/}
                    {/*        </div>*/}
                    {/*    ) : (*/}
                    {/*        <div className="flex flex-col items-center justify-center py-20">*/}
                    {/*            <Image*/}
                    {/*                alt="missing roadmap"*/}
                    {/*                src="https://illustrations.popsy.co/gray/success.svg"*/}
                    {/*                width={400}*/}
                    {/*                height={400}*/}
                    {/*                className="dark:hidden"*/}
                    {/*            />*/}
                    {/*            <Image*/}
                    {/*                alt="missing roadmap"*/}
                    {/*                src="https://illustrations.popsy.co/white/success.svg"*/}
                    {/*                width={400}*/}
                    {/*                height={400}*/}
                    {/*                className="hidden dark:block"*/}
                    {/*            />*/}
                    {/*            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">*/}
                    {/*                No roadmaps yet.*/}
                    {/*            </p>*/}
                    {/*        </div>*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/*{roadmaps?.length > 1 && (*/}
                    {/*    <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">*/}
                    {/*        <h2 className="mb-10 font-title text-4xl dark:text-white md:text-5xl">*/}
                    {/*            More stories*/}
                    {/*        </h2>*/}
                    {/*        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3">*/}
                    {/*            {roadmaps*/}
                    {/*                .slice(1)*/}
                    {/*                .map((metadata: any, index: number) => (*/}
                    {/*                    <BlogCard key={index} data={metadata}/>*/}
                    {/*                ))}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>

                {/*<div className="col-span-2">*/}
                {/*    <Card className="">*/}
                {/*        <CardHeader>*/}
                {/*            <CardTitle>*/}
                {/*                More patient groups for you*/}
                {/*            </CardTitle>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <div className="flex justify-between space-x-4">*/}
                {/*                <Avatar>*/}
                {/*                    <AvatarImage src="https://github.com/vercel.png"/>*/}
                {/*                    <AvatarFallback>VC</AvatarFallback>*/}
                {/*                </Avatar>*/}
                {/*                <div className="space-y-1">*/}
                {/*                    <h4 className="text-sm font-semibold">@nextjs</h4>*/}
                {/*                    <p className="text-sm">*/}
                {/*                        The React Framework – created and maintained by @vercel.*/}
                {/*                    </p>*/}
                {/*                    <div className="flex items-center pt-2">*/}
                {/*                        <CalendarDays className="mr-2 h-4 w-4 opacity-70"/>{" "}*/}
                {/*                        <span className="text-xs text-muted-foreground">*/}
                {/*                            Joined December 2021*/}
                {/*                        </span>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </CardContent>*/}
                {/*        <CardFooter className="flex justify-between">*/}
                {/*        </CardFooter>*/}
                {/*    </Card>*/}
                {/*</div>*/}
            </main>
            <PublicPageFooter/>
        </>
    )
}
