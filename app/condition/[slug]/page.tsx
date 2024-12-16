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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import {CalendarDays, FolderOpen} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {faker} from "@faker-js/faker";
import {bioassets} from "@/lib/data";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Condition, Organization} from "@prisma/client";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import ConditionProfilePatientGroupCard from "@/components/condition-profile-patient-group-card";
import {ConditionProfileRecentActivityCard} from "@/components/ui/condition-profile-recent-activity-card";
import PublicPageFooter from "@/components/public-page-footer";
import Link from "next/link";
import { FloatingDock } from "@/components/floating-dock";
import {IconBrandGithub, IconEdit, IconFlag, IconHome, IconShare, IconShare2, IconShare3} from "@tabler/icons-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export type Post = {
    id: string
    user: {
        name: string
        username: string
        avatar: string
    }
    content: string
    image: string
    likes: number
    comments: number
    shares: number
    timestamp: string
}

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

const similarConditions = [
    {
        name: "Celocyn Syndrome",
        description:
            "Celocyn Syndrome is a progressive and degenerative disorder affecting the brain, characterized by severe neurological symptoms.",
    },
    {
        name: "Myhre Syndrome",
        description:
            "Myhre syndrome is a rare genetic disorder that affects connective tissue and causes a variety of symptoms in many parts of the body.",
    },
    // Add more conditions here as needed
]

export default async function ConditionPage({
                                                params
                                            }: {
    params: { domain: string; slug: string }
}) {
    faker.seed(14)
    const forms = await getForms()
    const slug = decodeURIComponent(params.slug)

    let data: Condition & {
        organizations: { organization: Organization }[];
    } | null = null
    const response = await getConditionData(slug)
    if (response.success) {
        data = response.data
    } else {
        console.error(response.error)
    }

    if (!data) {
        notFound()
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center justify-center my-24 space-y-24 max-w-7xl mx-auto">
                <div className="flex flex-col items-center justify-center mt-8 space-y-8">
                    {/*<Breadcrumb>*/}
                    {/*    <BreadcrumbList>*/}
                    {/*        <BreadcrumbItem>*/}
                    {/*            <BreadcrumbLink href="/">Home</BreadcrumbLink>*/}
                    {/*        </BreadcrumbItem>*/}
                    {/*        <BreadcrumbSeparator/>*/}
                    {/*        <BreadcrumbItem>*/}
                    {/*            <BreadcrumbLink href="/docs/components">*/}
                    {/*                Neurodegenerative disorders*/}
                    {/*            </BreadcrumbLink>*/}
                    {/*        </BreadcrumbItem>*/}
                    {/*        <BreadcrumbSeparator/>*/}
                    {/*        <BreadcrumbItem>*/}
                    {/*            <BreadcrumbLink href="/docs/components">*/}
                    {/*                Leukodystrophies*/}
                    {/*            </BreadcrumbLink>*/}
                    {/*        </BreadcrumbItem>*/}
                    {/*        <BreadcrumbSeparator/>*/}
                    {/*        <BreadcrumbItem>*/}
                    {/*            <BreadcrumbPage>Arcadion Disease</BreadcrumbPage>*/}
                    {/*        </BreadcrumbItem>*/}
                    {/*    </BreadcrumbList>*/}
                    {/*</Breadcrumb>*/}

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

                    <div className="flex flex-col items-center justify-center space-y-8">
                        <div className="grid grid-cols-4">
                            <div className="space-y-2 flex flex-col items-center">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Disease Categories
                                </h3>
                                <div className="space-y-1 space-x-1 text-center">
                                    {data.diseaseCategories.map((category, index) =>
                                        <Badge size="large" key={index}>
                                            {category}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 flex flex-col items-center">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Signs and Symptoms
                                </h3>
                                <div className="space-y-1 space-x-1 text-center">
                                    {data.associatedSignsAndSymptoms.map((sign, index) =>
                                        <Badge size="large" key={index}>
                                            {sign}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 flex flex-col items-center">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Associated Genes
                                </h3>
                                <div className="space-y-1 space-x-1 text-center">
                                    {data.associatedGenes.map((gene, index) =>
                                        <Badge size="large" key={index}>
                                            {gene}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 flex flex-col items-center">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Disease Mechanisms
                                </h3>
                                <div className="space-y-1 space-x-1 text-center">
                                    {data.relevantDiseaseMechanisms.map((mechanism, index) =>
                                        <Badge size="large" key={index}>
                                            {mechanism}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-1 space-y-2">
                                <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                    Description
                                </h3>
                                <p>
                                    {data.description}
                                </p>
                            </div>

                            <div className="col-span-1 flex flex-col space-y-8">
                                <div className="space-y-2">
                                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                                        Stats
                                    </h3>
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
                                </div>

                                <div className="space-y-2">
                                    <h3 className="scroll-m-20 text-xl tracking-tight font-semibold">
                                        Similar conditions
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {similarConditions.map((condition, index) => (
                                            <div key={index} className="flex justify-between space-x-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-semibold">{condition.name}</h4>
                                                    <p>{condition.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold">
                        Associated Patient Groups
                    </h2>
                    {/*<UserFormsDataTable data={forms} columns={userFormsTableColumns}/>*/}
                    <Carousel>
                        <CarouselContent className="p-4">
                            {data.organizations.map((organization, index) => (
                                <Link
                                    key={index}
                                    href={`${organization.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                    className="md:basis-1/2 lg:basis-1/3"
                                >
                                    <CarouselItem >
                                        <ConditionProfilePatientGroupCard organization={organization.organization}/>
                                    </CarouselItem>
                                </Link>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious/>
                        <CarouselNext/>
                    </Carousel>
                </div>

                <div className="w-full space-y-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold">
                        Associated Assets
                    </h2>
                    <Carousel>
                        <CarouselContent className="p-4">
                            {true ?
                                <Card className="w-full mx-auto">
                                    <CardContent
                                        className="flex flex-col items-center justify-center p-6 text-center">
                                        <FolderOpen className="w-12 h-12 text-gray-400 mb-4"/>
                                        <h3 className="text-lg font-semibold mb-2">No assets</h3>
                                        <p className="text-sm text-gray-500">
                                            {`We don't have any assets yet.`}
                                        </p>
                                    </CardContent>
                                </Card> :
                                Array.from({length: 10}).map((_, index) => (
                                    <CarouselItem
                                        key={index}
                                        className="md:basis-1/2 lg:basis-1/3"
                                    >
                                        {/*<ConditionProfilePatientGroupCard/>*/}
                                    </CarouselItem>
                                ))
                            }
                        </CarouselContent>
                        <CarouselPrevious/>
                        <CarouselNext/>
                    </Carousel>
                </div>

                <div className="w-full space-y-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold">
                        Associated Request For Proposals
                    </h2>
                    <Carousel>
                        <CarouselContent className="p-4">
                            {true ?
                                <Card className="w-full mx-auto">
                                    <CardContent
                                        className="flex flex-col items-center justify-center p-6 text-center">
                                        <FolderOpen className="w-12 h-12 text-gray-400 mb-4"/>
                                        <h3 className="text-lg font-semibold mb-2">No RFPs</h3>
                                        <p className="text-sm text-gray-500">
                                            {`We don't have any requests for proposals yet.`}
                                        </p>
                                    </CardContent>
                                </Card> :
                                Array.from({length: 10}).map((_, index) => (
                                    <CarouselItem
                                        key={index}
                                        className="md:basis-1/2 lg:basis-1/3"
                                    >
                                        {/*<ConditionProfilePatientGroupCard/>*/}
                                    </CarouselItem>
                                ))
                            }
                        </CarouselContent>
                        <CarouselPrevious/>
                        <CarouselNext/>
                    </Carousel>
                </div>

                <div className="w-full space-y-8">
                    <h2 className="text-center text-3xl md:text-4xl font-bold">
                        Recent activity
                    </h2>
                    <Carousel>
                        <CarouselContent className="p-4 gap-4">
                            {posts.map((post, index) => (
                                <ConditionProfileRecentActivityCard post={post} key={index}/>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious/>
                        <CarouselNext/>
                    </Carousel>
                </div>
            </div>
            <PublicPageFooter/>

            <FloatingDock
                items={[
                    {
                        title: "Edit condition page",
                        icon: <IconEdit />,
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
                                    <Input id="name" defaultValue="John Doe" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </>
                        ),
                    },
                    {
                        title: "Post on feed",
                        icon: <IconShare2 />,
                        href: "/app/feed",
                    },
                    {
                        title: "Share on social media",
                        icon: <IconShare />,
                        href: "/dashboard",
                    },
                    {
                        title: "Report an issue",
                        icon: <IconFlag />,
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
                                    <Input id="name" defaultValue="John Doe" />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </>
                        ),
                    }
                ]}
                desktopClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2"
            />

        </TooltipProvider>
    )
}
