import {notFound} from "next/navigation"
import prisma from "@/lib/prisma"
import {getConditionData, getConditionsDataFromOrgId} from "@/lib/fetchers"
import {cn, formatDate, toDateString} from "@/lib/utils"
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
import React from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Overview from "@/app/(admin)/admin/page";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {FaUserCheck, FaUserPlus, FaUsersViewfinder} from "react-icons/fa6";
import HumanAnatomyMap from "@/components/human-anatomy-map";
import {Badge} from "@/components/ui/badge";
import {CalendarDays} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {faker} from "@faker-js/faker";
import {bioassets} from "@/lib/data";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {toast} from "sonner";

export async function generateMetadata({
                                           params
                                       }: {
    params: { domain: string; slug: string }
}) {
    const slug = decodeURIComponent(params.slug)

    let data = null
    const response = await getConditionData(slug)
    if (response.success) {
        data = response.data
    } else {
        console.error(response.error)
        toast.error(response.error)
    }

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

export default async function SitePostPage({
                                               params
                                           }: {
    params: { domain: string; slug: string }
}) {
    faker.seed(14)
    const forms = await getForms()
    const slug = decodeURIComponent(params.slug)

    let data = null
    const response = await getConditionData(slug)
    if (response.success) {
        data = response.data
    } else {
        console.error(response.error)
        toast.error(response.error)
    }

    if (!data) {
        notFound()
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center justify-center my-24 space-y-24 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center space-y-8">
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
                            {data.summary}
                        </p>

                    </div>
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
                        <div className="grid gap-8 grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                        Stats
                                    </h3>
                                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 h-fit">
                                        <Card>
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            Patient identified
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80">
                                                            <p>
                                                                {`Straightforward count of known cases, e.g., "Fewer than 1,000 cases have been identified worldwide.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </CardTitle>
                                                <FaUserCheck/>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {data.numberOfIdentifiedPatients}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    +20% from last month
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            Prevalence
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80">
                                                            <p>
                                                                {`The estimated proportion of a population that has a characteristic at a specific time, regardless of when they first developed it.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </CardTitle>
                                                <FaUsersViewfinder/>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {data.prevalenceNumerator} in {data.prevalenceDenominator}
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader
                                                className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            Incidence
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-80">
                                                            <p>
                                                                {`The number of new cases of a characteristic that develop in a population over a specific time period.`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </CardTitle>
                                                <FaUserPlus/>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    +2 this year
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                                <HumanAnatomyMap/>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                        Disease Categories
                                    </h3>
                                    <Badge>
                                        {data.diseaseCategories}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                        Description
                                    </h3>
                                    <p>
                                        {data.description}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </TabsContent>

                    <TabsContent
                        value="scientific-details"
                        className="w-full"
                    >
                        <div className="grid gap-8 grid-cols-2">
                            <div className="space-y-4">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Bioassets
                                </h3>
                                <div className="space-y-4">
                                    {faker.helpers.arrayElements(bioassets, faker.number.int({
                                        min: 1,
                                        max: 5
                                    })).map((asset, index) => (
                                        <div key={index} className="flex justify-between space-x-4 w-fit">
                                            <Avatar>
                                                <AvatarImage src="https://github.com/vercel.png"/>
                                                <AvatarFallback>VC</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-semibold">
                                                    {asset.name}
                                                </h4>
                                                <p className="text-sm">
                                                    {asset.description}
                                                </p>
                                                <div className="flex items-center">
                                                    <CalendarDays className="mr-2 h-4 w-4 opacity-70"/>{" "}
                                                    <span className="text-xs text-muted-foreground">
                                                        Created {formatDate(asset.dateCreated)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Condition profiles
                                </h3>
                                <ExternalDiseaseProfilesTable/>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="faq"
                        className="w-full"
                    >
                        <div className="grid gap-8 grid-cols-2">
                            <div className="flex flex-col space-y-4">
                                <blockquote
                                    className="text-xl italic font-semibold text-left text-gray-900 dark:text-white">
                                    <p>{`"Flowbite is just awesome. It contains tons of predesigned components and pages
                                    starting from login screen to complex dashboard. Perfect choice for your next SaaS
                                    application."`}</p>
                                </blockquote>

                                <blockquote
                                    className="text-xl italic font-semibold text-right text-gray-900 dark:text-white">
                                    <p>{`"Flowbite is just awesome. It contains tons of predesigned components and pages
                                    starting from login screen to complex dashboard. Perfect choice for your next SaaS
                                    application."`}</p>
                                </blockquote>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It adheres to the WAI-ARIA design pattern.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It comes with default styles that matches the other
                                        components&apos; aesthetic.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. It&apos;s animated by default, but you can disable it if you
                                        prefer.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="w-full space-y-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold">
                        Associated organizations and individuals
                    </h2>
                    <UserFormsDataTable data={forms} columns={userFormsTableColumns}/>
                </div>
            </div>
        </TooltipProvider>
    )
}
