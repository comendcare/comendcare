import {notFound} from "next/navigation"
import prisma from "@/lib/prisma"
import {getDisorderData} from "@/lib/fetchers"
import {toDateString} from "@/lib/utils"
import * as domain from "node:domain";
import {
    Breadcrumb, BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Button} from "@/components/ui/button";
import {ExternalDiseaseProfilesTable} from "@/components/external-disease-profiles-table";
import {promises as fs} from "fs";
import path from "path";
import {z} from "zod";
import {UserFormsDataTable} from "@/components/organizations-data-table/user-forms-data-table";
import {userFormsTableColumns} from "@/components/organizations-data-table/user-forms-data-table-columns";
import {formSchema} from "@/lib/schemas";

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const slug = decodeURIComponent(params.slug)

    const data = await getDisorderData(slug)

    // Fallback to avoid passing null to title or description
    const title = data?.name || "Default Title" // Use a fallback title
    const description = data?.description || "Default description" // Use a fallback description

    if (!data) {
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

async function getForms() {
    const data = await fs.readFile(
        path.join(process.cwd(), "data/forms.json")
    )

    const forms = JSON.parse(data.toString())

    return z.array(formSchema).parse(forms)
}

const stats = [
    { name: 'Total forms', stat: '12', previousStat: '4', change: '200%', changeType: 'increase' },
    { name: 'Avg. Completion rate', stat: '86%', previousStat: '56%', change: '30%', changeType: 'increase' },
    { name: 'Next deadline', stat: 'Tomorrow', previousStat: '', change: '', changeType: '' },
]


export default async function SitePostPage({
                                               params
                                           }: {
    params: { domain: string; slug: string }
}) {
    const forms = await getForms()
    const slug = decodeURIComponent(params.slug)
    const data = await getDisorderData(slug)

    if (!data) {
        notFound()
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center mt-24 space-y-8 max-w-7xl mx-auto">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/docs/components">
                                Neurodegenerative disorders
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/docs/components">
                                Leukodystrophies
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Arcadion Disease</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col mx-auto w-full text-center md:w-7/12 space-y-4">
                    <div className="inline-flex items-baseline justify-center">
                        <h1 className="font-title text-3xl font-bold text-stone-800 dark:text-white md:text-6xl">
                            {data.name}
                        </h1>
                        <HoverCard
                            openDelay={0}
                            closeDelay={0}
                        >
                            <HoverCardTrigger
                                asChild
                            >
                                <Button variant="link">a.k.a</Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-fit">
                                <ul className="inline-flex flex-col justify-start items-start max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
                                    <li>
                                        AD
                                    </li>
                                    <li>
                                        Arcadion
                                    </li>
                                </ul>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                    <p className="mx-auto w-10/12 text-sm font-light text-stone-500 dark:text-stone-400 md:text-base">
                        Last updated {toDateString(data.createdAt)}
                    </p>
                    <p className="text-md m-auto w-10/12 text-stone-600 dark:text-stone-400 md:text-lg">
                        {data.description}
                    </p>

                </div>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mx-auto grid grid-cols-3 bg-white w-1/2">
                        <TabsTrigger
                            variant="outline"
                            value="overview"
                        >
                            <p className="w-full text-center">Overview</p>
                        </TabsTrigger>
                        <TabsTrigger
                            variant="outline"
                            value="scientific-details"
                        >
                            <p className="w-full text-center">Scientific Details</p>
                        </TabsTrigger>
                        <TabsTrigger
                            variant="outline"
                            value="faq"
                        >
                            <p className="w-full text-center">FAQ</p>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="overview"
                        className="w-full"
                    >

                    </TabsContent>
                    <TabsContent
                        value="scientific-details"
                        className="w-full"
                    >
                        <ExternalDiseaseProfilesTable/>
                    </TabsContent>
                    <TabsContent
                        value="faq"
                        className="w-full"
                    >

                    </TabsContent>
                </Tabs>
                <UserFormsDataTable data={forms} columns={userFormsTableColumns}/>
            </div>
        </>
    )
}
