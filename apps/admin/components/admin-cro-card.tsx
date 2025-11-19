import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import Link from "next/link";
import {getMilestonesForService, truncate} from "@comend/lib/utils";
import React, {useState} from "react";
import { CompanyWithReviewsAndServices } from "@comend/lib/types";
import {
    Briefcase,
    Building,
    Building2,
    Factory,
    FileText,
    Dna,
    Rocket,
    Star,
    University,
    HeartHandshake
} from "lucide-react";
import {Milestone} from "@comend/lib/types";
import {PropertyBadge} from "@comend/components/property-badge";
import AdminCROCardDropdownMenu from "./admin-cro-card-dropdown-menu";
import ImageWithFallback from "@comend/components/image-with-fallback";
import type {Company} from "@prisma/client";
import {Badge} from "@comend/components/ui/badge";
import {Popover, PopoverContent, PopoverTrigger} from "@comend/components/ui/popover";
import {ScrollArea} from "@comend/components/ui/scroll-area";

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

export function AdminCROCard({cro, milestone, location}: { cro: CompanyWithReviewsAndServices, milestone?: Milestone, location?: string }) {
    const {id} = cro;

    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2">
                <CROCardHeaderContents cro={cro} milestone={milestone} location={location}/>
            </CardHeader>
            <CROCardContents cro={cro}/>
        </Card>
    )
}

export function CROCardHeaderContents({cro, milestone, location}: {
    cro: CompanyWithReviewsAndServices,
    milestone?: Milestone,
    location?: string
}) {
    const {id, title, description, companyType, avgRating} = cro;

    const favicon = <ImageWithFallback
        src={`https://www.google.com/s2/favicons?domain=${cro.url}`}
        alt="Resource favicon"
        className="inline-block h-6 w-6 rounded-md ring-2 ring-gray-300"
        fallback="/chrome favicon.png"
    />


    return (
        <>
            <div className="flex justify-between gap-2">
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/service-providers/${id}`
                            : `http://localhost:3000/app/service-providers/${id}`
                    }
                    className="flex flex-row gap-4 items-center"
                >
                    {favicon}
                    <CardTitle className="text-lg flex flex-row gap-2 items-center">
                        {title}
                    </CardTitle>
                </Link>
                <AdminCROCardDropdownMenu cro={cro} />
            </div>
            <Link
                href={
                    process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/service-providers/${id}`
                        : `http://localhost:3000/app/service-providers/${id}`
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
                    {/*{typeof avgRating === "number" && avgRating > 0 && (*/}
                    {/*    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">*/}
                    {/*        <Star className="size-4 text-gray-500 dark:text-gray-400" />*/}
                    {/*        {avgRating}*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
                {/*{description && description.trim() && (*/}
                {/*    <CardDescription className="text-wrap break-words line-clamp-2">*/}
                {/*        {truncate(description, 200)}*/}
                {/*    </CardDescription>*/}
                {/*)}*/}
                <div className="mt-2">
                    <RelatedProjectTypeBadges services={cro.services} />
                </div>
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
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/service-providers/${cro.id}`
                    : `http://localhost:3000/app/service-providers/${cro.id}`
            }
        >
            {Object.values(categoryCounts).some(count => count > 0) && (
                <CardContent className="flex flex-col items-start justify-center space-y-4">
                    <div>
                        {cro.tags && cro.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 w-5/6">
                                {cro.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
                                    >
                                        {tag === "Experienced in rare disease" && (
                                            <Dna className="h-3.5 w-3.5 shrink-0"/>
                                        )}
                                        {tag === "PAG friendly" && (
                                            <HeartHandshake className="h-3.5 w-3.5 shrink-0"/>
                                        )}
                                        <span className="truncate">
                                            {tag}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="grid w-full gap-2 grid-cols-1 sm:grid-cols-2">
                        {categoryLabels
                            // .filter(({key}) => categoryCounts[key] > 0)
                            .map(({key, icon: Icon, label}, index) => {
                                const count = categoryCounts[key];
                                const isReview = key === "reviews";
                                return (
                                    count > 0 && (
                                        <PropertyBadge key={key} icon={Icon}>
                                            {isReview ? (
                                                count > 0 ? (
                                                    <div className="flex items-center gap-x-1">
                                                        {cro.avgRating != null
                                                            ? `${Number(cro.avgRating % 1 === 0 ? cro.avgRating : cro.avgRating.toFixed(1))} (${count} ${count === 1 ? 'review' : 'reviews'})`
                                                            : 'N/A'}
                                                    </div>
                                                ) : (
                                                    <div>No reviews yet</div>
                                                )
                                            ) : (
                                                <div className="flex flex-row">
                                                    {label}:&nbsp;
                                                    <div>{count}</div>
                                                </div>
                                            )}
                                        </PropertyBadge>
                                    )
                                );
                            })}
                    </div>
                </CardContent>
            )}
        </Link>
    )
}

type ServiceLike = string | { name?: string | null }

export function RelatedProjectTypeBadges({
                                             services,
                                             maxVisible = 3,
                                         }: {
    services?: ServiceLike[]
    maxVisible?: number
}) {
    // 1) Extract service names
    const names = (services ?? [])
        .map((s) => (typeof s === "string" ? s : s?.name))
        .filter((n): n is string => Boolean(n && n.trim()))

    // 2) Gather + dedupe milestones
    const map = new Map<string, { id: string; label: string | undefined }>()
    for (const name of names) {
        for (const m of getMilestonesForService(name)) {
            if (!map.has(m.id)) map.set(m.id, { id: m.id, label: m.label })
        }
    }
    const milestones = Array.from(map.values())

    if (!milestones.length) return <span className="text-muted-foreground">—</span>

    const visible = milestones.slice(0, Math.max(0, maxVisible))
    const hidden = milestones.slice(Math.max(0, maxVisible))

    return (
        <div className="flex flex-wrap items-center gap-1">
            {visible.map((m) => (
                <Badge
                    key={m.id}
                    variant="secondary"
                    className="px-2 py-1 whitespace-normal break-words text-left text-xs"
                    title={m.label}
                >
                    {m.label}
                </Badge>
            ))}

            {hidden.length > 0 && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Badge
                            variant="secondary"
                            className="px-2 cursor-pointer text-xs"
                            title={hidden.map((h) => h.label).join(", ")}
                        >
                            +{hidden.length} more
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent align="start" side="bottom" className="w-72 p-2">
                        <ScrollArea className="max-h-48">
                            <div className="flex flex-wrap gap-1">
                                {hidden.map((m) => (
                                    <Badge key={m.id} variant="secondary" className="px-2 max-w-[12rem] truncate text-xs" title={m.label}>
                                        {m.label}
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}
