import prisma from "@/lib/prisma"
import {notFound} from "next/navigation"
import BlogCard from "@/components/blog-card"
import {getRoadmapsForOrganization, getOrganizationData, getConditionsDataFromOrgId} from "@/lib/fetchers"
import PAGPublicProfileHeader from "@/components/pag-public-profile-header";
import {PublicRoadmapCard} from "@/components/public-roadmap-card";
import {PAGProfileActivityCard} from "@/components/pag-profile-activity-card";
import {PagProfileAboutCard} from "@/components/pag-profile-about-card";
import {PAGProfileConditionsCard} from "@/components/pag-profile-conditions-card";
import {FloatingDock} from "@/components/floating-dock";
import {IconFlag, IconShare, IconShare2} from "@tabler/icons-react";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import ShareDialog from "@/components/share-dialog";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {Card, CardContent} from "@/components/ui/card";
import Image from "next/image";
import { PAGProfileAssetsAndRFPsHoverableCard } from "@/components/pag-profile-assets-and-projects-hoverable-card";

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
        where: {roadmapId: organization.roadmaps?.[0]?.id},
        include: {
            attachments: true,
            contacts: true,
            tasks: {
                orderBy: {orderPosition: 'asc'},
                include: {
                    checklist: {orderBy: {orderPosition: 'asc'}}
                }
            },
            node: true
        }
    })

    let conditions = null
    if (organization) {
        const response = await getConditionsDataFromOrgId(organization?.id)
        if (response.success) {
            conditions = response.data
        } else {
            console.error(response.error)
        }
    }

    if (!organization.verified) {
        // Render unverified organization state
        return (
            <UnverifiedOrganizationPage organization={organization}/>
        );
    }

    return (
        <>
            <main className="grid grid-cols-8 w-full max-w-7xl mx-auto mt-16 gap-4">
                <div className="col-span-8 flex flex-col items-center space-y-8">
                    <PAGPublicProfileHeader organization={organization} />

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="relative md:col-span-2 space-y-4">
                            <div className="sticky top-4 space-y-4">
                                <PagProfileAboutCard organization={organization} />
                                <PAGProfileConditionsCard conditions={conditions} />
                            </div>
                        </div>

                        <div className="md:col-span-4 flex flex-col space-y-4">
                            <PAGProfileAssetsAndRFPsHoverableCard
                                isPrivate={false}
                                assets={roadmaps?.[0].milestones.filter((milestone) => milestone?.node?.type === "ASSET")}
                                rfps={roadmaps?.[0].milestones.filter((milestone) => milestone?.node?.type === "RFP")}
                                // assets={(roadmaps?.[0]?.milestones.filter(milestone => milestone.asset) || []).map(milestone => milestone.asset)}
                                // rfps={(roadmaps?.[0]?.milestones.filter(milestone => milestone.RFP) || []).map(milestone => milestone.RFP)}
                            />
                            {roadmaps.length > 0 ?
                                <PublicRoadmapCard
                                    roadmap={roadmaps?.[0]}
                                    subdomain={organization?.subdomain || undefined}
                                />
                                : <Card>
                                    <CardContent>
                                        <div className="flex flex-col items-center justify-center space-x-4 my-8">
                                            <h1 className="font-cal text-4xl">No research plan yet</h1>
                                            <Image
                                                alt="missing roadmap"
                                                src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                                width={400}
                                                height={400}
                                            />
                                            <p className="text-lg text-stone-500">
                                                {`${organization.name} doesn't have a roadmap yet.`}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            }
                        </div>
                    </div>

                    {/*{roadmaps?.length > 1 && (*/}
                    {/*    <div className="mx-5 mb-20 max-w-screen-xl lg:mx-24 2xl:mx-auto">*/}
                    {/*        <h2 className="mb-10 font-title text-4xl dark:text-white md:text-5xl">*/}
                    {/*            More stories*/}
                    {/*        </h2>*/}
                    {/*        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8">*/}
                    {/*            {roadmaps*/}
                    {/*                .slice(1)*/}
                    {/*                .map((metadata: any, index: number) => (*/}
                    {/*                    <BlogCard key={index} data={metadata} />*/}
                    {/*                ))}*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                </div>
            </main>

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
                        dialog: <ShareDialog url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}/>
                    },
                    {
                        title: "Report an issue",
                        icon: <IconFlag/>,
                        dialog: (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Edit profile</DialogTitle>
                                    <DialogDescription>
                                        {`Make changes to your profile here. Click save when you're done.`}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="John Doe"/>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </>
                        ),
                    }
                ]}
                orientation="vertical"
                desktopClassName="right-4"
            />
        </>
    )
}
