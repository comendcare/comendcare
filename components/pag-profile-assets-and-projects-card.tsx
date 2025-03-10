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
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { NODE_TYPE_OPTIONS } from "@/lib/types";

// Define types for statuses and environments
type Status = 'offline' | 'online' | 'error';
type Environment = 'Due' | 'New';

const statuses: Record<Status, string> = {
    offline: 'text-gray-500 bg-gray-100/10',
    online: 'text-green-400 bg-green-400/10',
    error: 'text-rose-400 bg-rose-400/10',
};

const environments: Record<Environment, string> = {
    Due: 'text-red-400 bg-red-400/10 ring-red-400/20',
    New: 'text-green-400 bg-green-400/10 ring-green-400/30',
};

interface RFP {
    id: number;
    href: string;
    projectName: string;
    teamName: string;
    status: Status;
    statusText: string;
    description: string;
    environment?: Environment;
}

const rfps: RFP[] = [
    {
        id: 1,
        href: '#',
        projectName: 'Arcadion Biomarker Study',
        teamName: 'Arcadia Research',
        status: 'offline',
        statusText: 'Initiated 1m 32s ago',
        description: 'Exploring biomarkers for early detection',
        environment: 'Due',
    },
    {
        id: 2,
        href: '#',
        projectName: 'Gene Therapy Initiative',
        teamName: 'Arcadia Foundation',
        status: 'online',
        statusText: 'In progress, launched 3m ago',
        description: 'Developing gene therapy approaches for Arcadion Syndrome',
    },
    {
        id: 3,
        href: '#',
        projectName: 'Clinical Trial Optimization',
        teamName: 'Rare Disease Lab',
        status: 'offline',
        statusText: 'Started 3h ago',
        description: 'Improving clinical trial outcomes for rare diseases',
        environment: 'New',
    },
    {
        id: 4,
        href: '#',
        projectName: 'Drug Repurposing for Arcadion',
        teamName: 'Pharma Innovations',
        status: 'error',
        statusText: 'Failed to initiate 6d ago',
        description: 'Repurposing FDA-approved drugs for Arcadion Syndrome',
        environment: 'New',
    },
];

const milestones = [
    {text: "Identified biomarkers ", highlight: "2 years ago"},
    {text: "Mouse model created "},
    {text: "Contact registry available"},
    {text: "Natural history study ", highlight: "ongoing"},
    {text: "Gene therapy trial ", highlight: "1 month ago"},
    {text: "Patient advocacy group ", highlight: "501c3 status designated"},
    // {text: "Published in a peer-reviewed journal ", highlight: "last year"},
    // {text: "FDA orphan drug status approved"}
]

export const PAGProfileAssetsAndProjectsCard = () => {
    faker.seed(123)
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="scroll-m-20 text-2xl font-bold tracking-tight">
                    Milestones
                </CardTitle>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/app/research-plan")}
                    className="inline-flex flex-row justify-center items-center gap-x-2 text-base"
                >
                    Edit research plan
                    <FaArrowUpRightFromSquare/>
                </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-2">
                <div className="flex flex-col space-y-4">
                    <span className="flex gap-2">
                        <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                            {`Assets`}
                        </h3>
                        {NODE_TYPE_OPTIONS.find(value => value.value === "ASSET") && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <FaInfoCircle />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left">
                                        {NODE_TYPE_OPTIONS.find(value => value.value === "ASSET")?.description}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </span>
                    <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
                        {faker.helpers.arrayElements(milestones, faker.number.int({
                            min: 3,
                            max: 7
                        })).map((item, index) => (
                            <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                                <svg
                                    className="flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 16 12"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M1 5.917 5.724 10.5 15 1.5"
                                    />
                                </svg>
                                <span>
                                    {item.text}
                                    {item.highlight && (
                                        <span
                                            className="font-semibold text-gray-900 dark:text-white">{item.highlight}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col space-y-4">
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Projects
                    </h3>
                    <ul role="list" className="divide-y">
                        <Dialog>
                            <DialogTrigger className="w-full">
                                {rfps.map((rfp) => (
                                    <li key={rfp.id} className="relative flex items-center justify-between space-x-4 py-2">
                                        <div className="flex flex-col justify-start items-start min-w-0 flex-auto">
                                            <div className="flex items-center gap-x-3">
                                                {/*<div*/}
                                                {/*    className={cn(statuses[rfp.status], 'flex-none rounded-full p-1')}>*/}
                                                {/*    <div className="h-2 w-2 rounded-full bg-current"/>*/}
                                                {/*</div>*/}
                                                <h2 className="min-w-0 text-sm/6 font-semibold">
                                                    <a href={rfp.href} className="flex gap-x-2">
                                                        <span className="truncate">{rfp.projectName}</span>
                                                    </a>
                                                </h2>
                                            </div>
                                            <div className="mt-2 flex items-center gap-x-2.5 text-xs/5 text-gray-400">
                                                {/*<p className="truncate">*/}
                                                {/*    {rfp.description}*/}
                                                {/*</p>*/}
                                                {/*<svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300">*/}
                                                {/*    <circle r={1} cx={1} cy={1}/>*/}
                                                {/*</svg>*/}
                                                <p className="whitespace-nowrap">
                                                    {rfp.statusText}
                                                </p>
                                            </div>
                                        </div>
                                        {rfp.environment &&
                                            <div
                                                className={cn(
                                                    environments[rfp.environment],
                                                    'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                                                )}
                                            >
                                                {rfp.environment}
                                            </div>
                                        }
                                        <FaChevronRight aria-hidden="true" className="h-3 w-3 flex-none text-gray-400"/>
                                    </li>
                                ))}
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Request for proposals:
                                    </DialogTitle>
                                    <DialogDescription>
                                        Proposal for Arcadion Syndrome Research
                                    </DialogDescription>
                                </DialogHeader>
                                <div>
                                    <div className="mt-6">
                                        <dl className="grid grid-cols-1 sm:grid-cols-2">
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Principal Investigator
                                                </dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">Dr. Margot Foster</dd>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Research Focus</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">Gene Therapy</dd>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Contact Email</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">margotfoster@example.com</dd>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Funding Available</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">$500,000</dd>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Proposal Summary</dt>
                                                <dd className="mt-1 text-sm/6 text-gray-700 sm:mt-2">
                                                    This study focuses on advancing therapeutic options for Arcadion
                                                    Syndrome by targeting specific genetic mutations. The project aims to
                                                    explore gene therapy applications to correct or inhibit genetic pathways
                                                    associated with the disease.
                                                </dd>
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                                                <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
                                                <dd className="mt-2 text-sm text-gray-900">
                                                    <ul role="list"
                                                        className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                                        <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                                            <div className="flex w-0 flex-1 items-center">
                                                                <FaPaperclip aria-hidden="true"
                                                                             className="h-5 w-5 shrink-0 text-gray-400"/>
                                                                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                                    <span
                                                                        className="truncate font-medium">study_overview.pdf</span>
                                                                    <span className="shrink-0 text-gray-400">1.2mb</span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 shrink-0">
                                                                <a href="#"
                                                                   className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                    Download
                                                                </a>
                                                            </div>
                                                        </li>
                                                        <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                                            <div className="flex w-0 flex-1 items-center">
                                                                <FaPaperclip aria-hidden="true"
                                                                             className="h-5 w-5 shrink-0 text-gray-400"/>
                                                                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                                    <span
                                                                        className="truncate font-medium">budget_summary.pdf</span>
                                                                    <span className="shrink-0 text-gray-400">500kb</span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4 shrink-0">
                                                                <a href="#"
                                                                   className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                    Download
                                                                </a>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};
