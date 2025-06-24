"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { ChevronRight, Paperclip } from "lucide-react";

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

export const PAGProfileOpenRFPsCard = () => {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Projects
                </CardTitle>
            </CardHeader>

            <CardContent>
                <ul role="list" className="divide-y">
                    <Dialog>
                        <DialogTrigger className="w-full">
                            {rfps.map((rfp) => (
                                <li key={rfp.id} className="relative flex items-center justify-between space-x-4 py-4">
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
                                        <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-gray-400">
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
                                    <ChevronRight aria-hidden="true" className="h-3 w-3 flex-none text-gray-400"/>
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
                                            <dt className="text-sm/6 font-medium text-gray-900">Principal Investigator</dt>
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
                                                This study focuses on advancing therapeutic options for Arcadion Syndrome by targeting specific genetic mutations. The project aims to explore gene therapy applications to correct or inhibit genetic pathways associated with the disease.
                                            </dd>
                                        </div>
                                        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                                            <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
                                            <dd className="mt-2 text-sm text-gray-900">
                                                <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                                        <div className="flex w-0 flex-1 items-center">
                                                            <Paperclip aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400" />
                                                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                                <span className="truncate font-medium">study_overview.pdf</span>
                                                                <span className="shrink-0 text-gray-400">1.2mb</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 shrink-0">
                                                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                Download
                                                            </a>
                                                        </div>
                                                    </li>
                                                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
                                                        <div className="flex w-0 flex-1 items-center">
                                                            <Paperclip aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400" />
                                                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                                <span className="truncate font-medium">budget_summary.pdf</span>
                                                                <span className="shrink-0 text-gray-400">500kb</span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 shrink-0">
                                                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
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
            </CardContent>
        </Card>
    )
};
