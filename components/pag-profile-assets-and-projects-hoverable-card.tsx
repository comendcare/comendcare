"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {FaArrowUpRightFromSquare, FaChevronRight, FaPaperclip, FaPen} from "react-icons/fa6";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {faker} from "@faker-js/faker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

// Define types for statuses and environments
type Recency = 'Due' | 'New';

const environments: Record<Recency, string> = {
    Due: 'text-red-400 bg-red-400/10 ring-red-400/20',
    New: 'text-green-400 bg-green-400/10 ring-green-400/30',
};

interface RFP {
    id: number
    href: string
    projectName: string
    teamName: string
    description: string
    recency?: Recency
    funding: number
    principal: string
    contactEmail: string
    researchFocus: string
    proposalSummary: string
}

interface Asset {
    id: number
    href: string
    projectName: string
    teamName: string
    description: string
    recency?: Recency
    principal: string
    contactEmail: string
    researchFocus: string
    assetSummary: string
}

const rfps: RFP[] = [
    {
        id: 1,
        href: '#',
        projectName: 'Arcadion Biomarker Study',
        teamName: 'Arcadia Research',
        description: 'Exploring biomarkers for early detection',
        recency: 'Due',
        funding: 500, // in thousands
        principal: 'Dr. Jane Doe',
        contactEmail: 'jane.doe@arcadiaresearch.org',
        researchFocus: 'Biomarker Discovery',
        proposalSummary: 'This study aims to identify biomarkers for the early detection of Arcadion Syndrome. The research involves advanced proteomics and genomics techniques. Findings from this study are expected to accelerate diagnostic timelines and improve patient outcomes.',
    },
    {
        id: 2,
        href: '#',
        projectName: 'Gene Therapy Initiative',
        teamName: 'Arcadia Foundation',
        description: 'Developing gene therapy approaches for Arcadion Syndrome',
        funding: 1200, // in thousands
        principal: 'Dr. John Smith',
        contactEmail: 'john.smith@arcadiafoundation.org',
        researchFocus: 'Gene Therapy',
        proposalSummary: 'This initiative focuses on designing and testing gene therapy solutions for Arcadion Syndrome. It leverages CRISPR technology to correct genetic mutations. The project will conduct preclinical studies to evaluate safety and efficacy.',
    },
    {
        id: 3,
        href: '#',
        projectName: 'Clinical Trial Optimization',
        teamName: 'Rare Disease Lab',
        description: 'Improving clinical trial outcomes for rare diseases',
        recency: 'New',
        funding: 750, // in thousands
        principal: 'Dr. Emily Carter',
        contactEmail: 'emily.carter@rarediseaselab.com',
        researchFocus: 'Clinical Trial Design',
        proposalSummary: 'This proposal aims to enhance clinical trial efficiency for rare diseases, focusing on patient recruitment and retention strategies. The study will analyze existing data and develop predictive models. The goal is to improve trial success rates while reducing costs.',
    },
    {
        id: 4,
        href: '#',
        projectName: 'Drug Repurposing for Arcadion',
        teamName: 'Pharma Innovations',
        description: 'Repurposing FDA-approved drugs for Arcadion Syndrome',
        recency: 'New',
        funding: 300, // in thousands
        principal: 'Dr. Alan Brown',
        contactEmail: 'alan.brown@pharmainnovations.com',
        researchFocus: 'Drug Repurposing',
        proposalSummary: 'The project investigates FDA-approved drugs for potential efficacy against Arcadion Syndrome. Using computational modeling and laboratory validation, the study seeks to identify cost-effective treatment options. Results will support rapid translation to clinical applications.',
    },
]

const assets: Asset[] = [
    {
        id: 1,
        href: '#',
        projectName: 'Biomarker Identification',
        teamName: 'Arcadia Research',
        description: 'Identified key biomarkers for Arcadion Syndrome.',
        recency: 'New',
        principal: 'Dr. Jane Doe',
        contactEmail: 'jane.doe@arcadiaresearch.org',
        researchFocus: 'Biomarker Discovery',
        assetSummary: 'This project identified critical biomarkers for early detection and diagnosis of Arcadion Syndrome. These findings are expected to pave the way for further diagnostic advancements and research into disease progression.',
    },
    {
        id: 2,
        href: '#',
        projectName: 'Mouse Model Development',
        teamName: 'Arcadia Research',
        description: 'Developed a mouse model for preclinical studies.',
        recency: 'New',
        principal: 'Dr. John Smith',
        contactEmail: 'john.smith@arcadiafoundation.org',
        researchFocus: 'Animal Models',
        assetSummary: 'The development of a robust mouse model for Arcadion Syndrome enables preclinical testing of therapeutic interventions. This model mimics human disease progression, providing critical insights into potential treatments.',
    },
    {
        id: 3,
        href: '#',
        projectName: 'Contact Registry Establishment',
        teamName: 'Rare Disease Lab',
        description: 'Built a comprehensive contact registry for patients.',
        principal: 'Dr. Emily Carter',
        contactEmail: 'emily.carter@rarediseaselab.com',
        researchFocus: 'Patient Registry',
        assetSummary: 'This project established a centralized contact registry for Arcadion Syndrome patients, enabling improved communication and engagement. The registry serves as a foundation for future clinical and research initiatives.',
    },
    {
        id: 4,
        href: '#',
        projectName: 'Natural History Study',
        teamName: 'Arcadia Foundation',
        description: 'Ongoing study to document disease progression.',
        principal: 'Dr. Alan Brown',
        contactEmail: 'alan.brown@pharmainnovations.com',
        researchFocus: 'Natural History',
        assetSummary: 'An ongoing natural history study capturing critical data on Arcadion Syndrome progression. This study provides invaluable insights for researchers and clinicians, supporting evidence-based approaches to treatment and care.',
    },
    {
        id: 5,
        href: '#',
        projectName: 'Gene Therapy Trial',
        teamName: 'Pharma Innovations',
        description: 'Launched gene therapy trials for Arcadion Syndrome.',
        principal: 'Dr. Sarah White',
        contactEmail: 'sarah.white@pharmainnovations.com',
        researchFocus: 'Gene Therapy',
        assetSummary: 'This trial focuses on testing the safety and efficacy of a novel gene therapy for Arcadion Syndrome. Early results are promising, showing potential for addressing the underlying genetic causes of the disease.',
    },
    {
        id: 6,
        href: '#',
        projectName: 'Patient Advocacy Group Formation',
        teamName: 'Arcadia Advocacy',
        description: 'Formed a patient advocacy group with 501(c)(3) status.',
        principal: 'Dr. Megan Lee',
        contactEmail: 'megan.lee@arcadiaadvocacy.org',
        researchFocus: 'Advocacy',
        assetSummary: 'This initiative led to the formation of a patient advocacy group for Arcadion Syndrome. The group provides crucial support and resources to patients and families while advocating for increased research funding.',
    },
    {
        id: 7,
        href: '#',
        projectName: 'Publication in Peer-Reviewed Journal',
        teamName: 'Rare Disease Lab',
        description: 'Published key findings in a leading scientific journal.',
        principal: 'Dr. Emily Carter',
        contactEmail: 'emily.carter@rarediseaselab.com',
        researchFocus: 'Research Publication',
        assetSummary: 'This publication presents groundbreaking findings on Arcadion Syndrome. The study provides insights into disease mechanisms and potential therapeutic targets, establishing a foundation for future research.',
    },
    {
        id: 8,
        href: '#',
        projectName: 'FDA Orphan Drug Status Approval',
        teamName: 'Pharma Innovations',
        description: 'Secured FDA orphan drug status for Arcadion treatment.',
        principal: 'Dr. Alan Brown',
        contactEmail: 'alan.brown@pharmainnovations.com',
        researchFocus: 'Regulatory Approval',
        assetSummary: 'Achieving FDA orphan drug status for Arcadion Syndrome treatment represents a significant milestone. This designation incentivizes further development and commercialization of therapeutic solutions.',
    },
]

export const PAGProfileAssetsAndProjectsHoverableCard = () => {
    faker.seed(123)
    const router = useRouter();

    return (
        <Card className="organization-profile-tour-step4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Milestones
                </CardTitle>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/app/roadmap")}
                    className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                >
                    Edit research plan
                    <FaArrowUpRightFromSquare/>
                </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Assets
                    </h3>
                    <ul role="list" className="divide-y">
                        {faker.helpers.arrayElements(assets, faker.number.int({
                            min: 2,
                            max: 5
                        })).map((asset) =>
                            <HoverCard
                                key={asset.id}
                                openDelay={0}
                                closeDelay={0}
                            >
                                <HoverCardTrigger asChild>
                                    <a href={asset.href}>
                                        <li
                                            key={asset.id}
                                            className="w-full flex items-center justify-between space-x-4 py-2"
                                        >
                                            <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                                                <div className="flex items-center gap-x-3">
                                                    <h2 className="min-w-0 text-sm font-semibold">
                                                        <span className="truncate">{asset.projectName}</span>
                                                    </h2>
                                                </div>
                                                <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                                                    <p className="whitespace-nowrap">
                                                        {faker.date.past({ years: 10 }).getFullYear()} &bull; {asset.principal}
                                                    </p>
                                                </div>
                                            </div>
                                            {asset.recency &&
                                                <div
                                                    className={cn(
                                                        environments[asset.recency],
                                                        'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                                    )}
                                                >
                                                    {asset.recency}
                                                </div>
                                            }
                                        </li>
                                    </a>
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="top"
                                    className="w-80"
                                >
                                    <div className="flex justify-between space-x-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">@nextjs</h4>
                                            <p className="text-sm">
                                                The React Framework – created and maintained by @vercel.
                                            </p>
                                            <div className="flex items-center pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Joined December 2021
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </ul>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Projects
                    </h3>
                    <ul role="list" className="divide-y">
                        {rfps.map((rfp) =>
                            <HoverCard
                                key={rfp.id}
                                openDelay={0}
                                closeDelay={0}
                            >
                                <HoverCardTrigger asChild>
                                    <a href={rfp.href}>
                                        <li
                                            key={rfp.id}
                                            className="w-full flex items-center justify-between space-x-4 py-2"
                                        >
                                            <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                                                <div className="flex items-center gap-x-3">
                                                    <h2 className="min-w-0 text-sm font-semibold">
                                                        <span className="truncate">{rfp.projectName}</span>
                                                    </h2>
                                                </div>
                                                <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                                                    <p className="whitespace-nowrap">
                                                        {`$${(rfp.funding * 1000).toLocaleString()}`} &bull; {rfp.principal}
                                                    </p>
                                                </div>
                                            </div>
                                            {rfp.recency &&
                                                <div
                                                    className={cn(
                                                        environments[rfp.recency],
                                                        'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                                    )}
                                                >
                                                    {rfp.recency}
                                                </div>
                                            }
                                        </li>
                                    </a>
                                </HoverCardTrigger>
                                <HoverCardContent
                                    side="top"
                                    className="w-80"
                                >
                                    <div className="flex justify-between space-x-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">@nextjs</h4>
                                            <p className="text-sm">
                                                The React Framework – created and maintained by @vercel.
                                            </p>
                                            <div className="flex items-center pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Joined December 2021
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};
