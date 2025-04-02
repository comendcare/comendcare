import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {truncate} from "@/lib/utils";
import React from "react";
import {Company} from "@prisma/client";
import {Separator} from "./ui/separator";
import {TypeBadge} from "./type-badge";
import SaveCRODialog from "@/components/save-cro-dialog";
import {Briefcase, Building, Building2, Factory, FileText, Rocket, Star, University} from "lucide-react";

type NodeTypeCount = Record<string, number>;

function countCategories(cro: any): NodeTypeCount {
    return {
        services: cro.services?.length || 0,
        certifications: cro.certifications?.length || 0,
        rfis: cro.rfis?.length || 0,
        sites: cro.sites?.length || 0,
        reviews: cro.reviews?.length || 0
    };
}

export const companyTypeMap: Record<string, string> = {
    "Mid-Sized Business (10-100M TTM Revenue)": "Mid-Sized Business",
    "Small Business (1-10M TTM Revenue)": "Small Business",
    "Academic Core Facility": "Academic Core Facility",
    "New Startup (0-1M TTM Revenue)": "New Startup",
    "Consultant (5 or more employees)": "Consultant",
    "Large Business (>100M TTM Revenue)": "Large Business",
    "Consultant (<5 employees)": "Consultant",
};

const companyTypeIcons: Record<string, JSX.Element> = {
    "Mid-Sized Business (10-100M TTM Revenue)": <Factory className="size-4 text-gray-500 dark:text-gray-400"/>,
    "Small Business (1-10M TTM Revenue)": <Building className="size-4 text-gray-500 dark:text-gray-400"/>,
    "Academic Core Facility": <University className="size-4 text-gray-500 dark:text-gray-400"/>,
    "New Startup (0-1M TTM Revenue)": <Rocket className="size-4 text-gray-500 dark:text-gray-400"/>,
    "Consultant (5 or more employees)": <Briefcase className="size-4 text-gray-500 dark:text-gray-400"/>,
    "Large Business (>100M TTM Revenue)": <Building2 className="size-4 text-gray-500 dark:text-gray-400"/>,
    "Consultant (<5 employees)": <Briefcase className="size-4 text-gray-500 dark:text-gray-400"/>,
};

export function CRORecommendationCard({cro, milestone}: { cro: Company, milestone: any }) {
    const {id} = cro;

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/cro/${id}`
                    : `http://localhost:3000/app/cro/${id}`
            }
        >
            <Card className="h-full w-full text-left flex flex-col justify-between">
                <CardHeader className="gap-2">
                    <CardDescription
                        className="text-base flex flex-row gap-2 items-center"
                    >
                        {milestone?.nodeType &&
                            <TypeBadge className="w-8 p-2" iconOnly={true} type={milestone?.nodeType}/>}
                        {milestone.title}
                    </CardDescription>
                    <Separator className="my-2"/>
                    <CROCardHeaderContents cro={cro}/>
                </CardHeader>
                <CROCardContents cro={cro}/>
            </Card>
        </Link>
    );
}

export function CROMarketplaceCard({cro}: { cro: Company }) {
    const {id} = cro;

    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2">
                <CROCardHeaderContents cro={cro}/>
            </CardHeader>
            <CROCardContents cro={cro}/>
        </Card>
    )
        ;
}

export function CROCardHeaderContents({cro}: { cro: Company }) {
    const {id, title, description, companyType, avgRating} = cro;

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/cro/${id}`
                            : `http://localhost:3000/app/cro/${id}`
                    }
                >
                    <CardTitle className="text-xl flex flex-row gap-2 items-center">
                        {title}
                    </CardTitle>
                </Link>
                <SaveCRODialog cro={cro} type={"card"}/>
            </div>
            <Link
                href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/cro/${id}`
                        : `http://localhost:3000/app/cro/${id}`
                }
                className="flex flex-col gap-2"
            >
                <div className="flex flex-row justify-between items-center">
                    {companyType && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            {companyTypeIcons[companyType] ||
                                <Building className="size-4 text-gray-500 dark:text-gray-400"/>}
                            {companyTypeMap[companyType] || companyType}
                        </div>
                    )}
                    {typeof avgRating === "number" && avgRating > 0 && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <Star className="size-4 text-gray-500 dark:text-gray-400" />
                            {avgRating}
                        </div>
                    )}
                </div>
                {description && description.trim() && (
                    <CardDescription className="text-wrap break-words line-clamp-2">
                        {truncate(description, 200)}
                    </CardDescription>
                )}
            </Link>
        </>
    )
}

export function CROCardContents({cro}: { cro: Company }) {
    const categoryCounts = countCategories(cro);

    const categoryLabels = [
        {key: "services", icon: FileText, label: "Services"},
        {key: "reviews", icon: Star, label: "Reviews"},
        // {key: "certifications", icon: Users, label: "Certifications"},
        // {key: "rfis", icon: Megaphone, label: "RFIs"},
        // {key: "sites", icon: MapPin, label: "Sites"}
    ];

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/cro/${cro.id}`
                    : `http://localhost:3000/app/cro/${cro.id}`
            }
        >
            {Object.values(categoryCounts).some(count => count > 0) && (
                <CardContent className="flex flex-col items-start justify-center">
                    <div className="grid w-full gap-2 grid-cols-1 sm:grid-cols-2">
                        {categoryLabels
                            .filter(({key}) => categoryCounts[key] > 0)
                            .map(({key, icon: Icon, label}, index) => {
                                const count = categoryCounts[key];
                                const isReview = key === "reviews";
                                return (
                                    <div
                                        key={key}
                                        className="text-xs flex flex-row justify-start items-center gap-x-1 border-l-2 border-gray-300 pl-2"
                                    >
                                        <Icon className="size-4" />
                                        {isReview ? (
                                            <div className="text-xs flex items-center gap-x-1">
                                                {cro.avgRating != null
                                                    ? `${Number(cro.avgRating % 1 === 0 ? cro.avgRating : cro.avgRating.toFixed(1))} (${count} ${count === 1 ? 'review' : 'reviews'})`
                                                    : 'N/A'}
                                            </div>
                                        ) : (
                                            <div className="flex flex-row text-xs">
                                                {label}:&nbsp;
                                                <div>{count}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            )}
        </Link>
    )
}
