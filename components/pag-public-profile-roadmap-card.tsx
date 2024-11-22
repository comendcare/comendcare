"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button, buttonVariants} from "@/components/ui/button";
import {FaPen} from "react-icons/fa6";
import {Workflow} from "lucide-react";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Roadmap} from "@prisma/client";
import Link from "next/link";

type RoadmapPreview = Pick<
    Roadmap,
    "slug" | "description" | "createdAt" | "image" | "imageBlurhash" | "title"
>

const roadmapItems = [
    {
        title: "Data Analysis and Next Steps Planning",
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-03-31T23:59:59Z",
        description: "Analyze results from Phase I trials to assess efficacy. Plan further clinical trials or expand research to focus on precision treatment approaches based on trial outcomes.",
        hasDownload: false,
    },
    {
        title: "Clinical Trial Phase I",
        startDate: "2024-07-01T00:00:00Z",
        endDate: "2024-09-30T23:59:59Z",
        description: "Launch Phase I clinical trials with a focus on safety and dosage. Monitor participants closely for initial response and adjust protocols as necessary.",
        hasDownload: true,
    },
    {
        title: "Patient Education and Community Outreach",
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
        description: "Develop educational materials and conduct workshops to support patients and families. Strengthen community engagement and advocacy efforts to raise awareness and gather support.",
        hasDownload: false,
    },
    {
        title: "Clinical Trial Preparation",
        startDate: "2024-04-01T00:00:00Z",
        endDate: "2024-06-30T23:59:59Z",
        description: "Work with regulatory bodies and research institutions to design early-stage clinical trials. Recruit patients and establish partnerships with medical centers for trial sites.",
        hasDownload: false,
    },
    {
        title: "Preclinical Research and Treatment Exploration",
        startDate: "2023-10-01T00:00:00Z",
        endDate: "2023-12-31T23:59:59Z",
        description: "Begin preclinical studies with research partners to explore existing compounds and potential treatments. This phase includes in vitro testing to identify promising therapeutic candidates.",
        hasDownload: false,
    },
    {
        title: "Genetic Analysis and Biomarker Identification",
        label: "Ongoing",
        startDate: "2023-03-15T00:00:00Z",
        endDate: "2024-03-15T23:59:59Z",
        description: "Collaborate with geneticists to analyze patient DNA samples and identify potential biomarkers associated with the disease. Early biomarkers will guide treatment and research priorities.",
        hasDownload: false,
    },
    {
        title: "Initial Patient Data Collection",
        label: "Phase 1",
        startDate: "2023-01-10T00:00:00Z",
        endDate: "2023-03-10T23:59:59Z",
        description: "Collect initial data from patients to understand the range of symptoms, genetic markers, and current treatments. Build a secure, anonymized database for research purposes.",
        hasDownload: false,
    },
];

export const PAGPublicProfileRoadmapCard = ({roadmap}: {roadmap: RoadmapPreview}) => {
    const router = useRouter();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Roadmap
                </CardTitle>
                <Link
                    href={`/${roadmap.slug}`}
                    className={cn(buttonVariants({variant: "secondary"}), "inline-flex items-center text-base")}
                >
                    <Workflow className="size-6"/>
                    View roadmap
                </Link>
            </CardHeader>

            <CardContent className="px-8">
                <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-8">
                    {roadmapItems.map((item, index) => (
                        <li key={index} className="ms-6">
                            <span
                                className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                </svg>
                            </span>
                            <div className="flex flex-row items-center justify-between">
                                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                                    {item.title}
                                    {item.label && (
                                        <span
                                            className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ms-3">
                                            {item.label}
                                        </span>
                                    )}
                                </h3>
                                <time
                                    className="block mb-2 font-semibold leading-none dark:text-gray-500">
                                    {`${new Date(item.startDate).toLocaleString('en-US', {
                                        month: 'short',
                                        year: 'numeric'
                                    })} - ${new Date(item.endDate).toLocaleString('en-US', {
                                        month: 'short',
                                        year: 'numeric'
                                    })}`}
                                </time>
                            </div>
                            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                {item.description}
                            </p>
                            {item.hasDownload && (
                                <a href="#"
                                   className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                    <svg className="w-3.5 h-3.5 me-2.5" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg"
                                         fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                                        <path
                                            d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    Download ZIP
                                </a>
                            )}
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};
