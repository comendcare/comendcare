import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {
    FaBuilding,
    FaBullhorn,
    FaLocationDot,
    FaCity,
    FaFileLines,
    FaIndustry,
    FaRocket,
    FaUsers,
    FaUserTie
} from "react-icons/fa6";
import {truncate} from "@/lib/utils";
import React from "react";
import {Company} from "@prisma/client";
import {FaUniversity} from "react-icons/fa";

type NodeTypeCount = Record<string, number>;

function countCategories(cro: any): NodeTypeCount {
    return {
        services: cro.services?.length || 0,
        certifications: cro.certifications?.length || 0,
        rfis: cro.rfis?.length || 0,
        sites: cro.sites?.length || 0
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
    "Mid-Sized Business (10-100M TTM Revenue)": <FaIndustry className="size-4 text-gray-500 dark:text-gray-400" />,
    "Small Business (1-10M TTM Revenue)": <FaBuilding className="size-4 text-gray-500 dark:text-gray-400" />,
    "Academic Core Facility": <FaUniversity className="size-4 text-gray-500 dark:text-gray-400" />,
    "New Startup (0-1M TTM Revenue)": <FaRocket className="size-4 text-gray-500 dark:text-gray-400" />,
    "Consultant (5 or more employees)": <FaUserTie className="size-4 text-gray-500 dark:text-gray-400" />,
    "Large Business (>100M TTM Revenue)": <FaCity className="size-4 text-gray-500 dark:text-gray-400" />,
    "Consultant (<5 employees)": <FaUserTie className="size-4 text-gray-500 dark:text-gray-400" />,
};

export function CROMarketplaceCard({cro}: { cro: Company }) {
    const {id, title, description, companyType} = cro;

    const categoryCounts = countCategories(cro);

    const categoryLabels = [
        {key: "services", icon: FaFileLines, label: "Services"},
        // {key: "certifications", icon: FaUsers, label: "Certifications"},
        // {key: "rfis", icon: FaBullhorn, label: "RFIs"},
        // {key: "sites", icon: FaLocationDot, label: "Sites"}
    ];

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
                    <CardTitle className="text-xl flex flex-row gap-2 items-center">
                        {title}
                    </CardTitle>
                    {companyType && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            {companyTypeIcons[companyType] || <FaBuilding className="size-4 text-gray-500 dark:text-gray-400" />}
                            {companyTypeMap[companyType] || companyType}
                        </div>
                    )}
                    {description && description.trim() && (
                        <CardDescription className="text-wrap break-words line-clamp-2">
                            {truncate(description, 200)}
                        </CardDescription>
                    )}
                </CardHeader>
                {Object.values(categoryCounts).some(count => count > 0) && (
                    <CardContent className="flex flex-col items-start justify-center">
                        <div className="grid w-full gap-2 grid-cols-1 sm:grid-cols-2">
                            {categoryLabels
                                .filter(({key}) => categoryCounts[key] > 0)
                                .map(({key, icon: Icon, label}, index) => {
                                    const count = categoryCounts[key];
                                    return (
                                        <div
                                            key={key}
                                            className={`text-xs flex flex-row justify-start items-center gap-x-1 border-l-2 border-gray-300 pl-2`}
                                        >
                                            <Icon className="size-4"/>
                                            {label}:<div className="text-sm">{count}</div>
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                )}
            </Card>
        </Link>
    );
}
