"use client";

import { useEffect, useState } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {getOrganizationAnalytics} from "@/lib/fetchers";

interface AnalyticsData {
    totalOrganizations: number;
    newOrganizationsThisMonth: number;
    newOrganizationsLastMonth: number;
    activeOrganizations: number;
    growthRate: number;
    completedProfiles: number;
}

export function AdminOrganizationsAnalyticsCards() {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getOrganizationAnalytics()
            .then((res) => res)
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    const growthPositive = data.growthRate >= 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Organizations</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalOrganizations.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Cumulative organizations
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>New Organizations This Month</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.newOrganizationsThisMonth.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            {growthPositive ? (
                                <>
                                    <TrendingUpIcon className="size-3" />
                                    +{data.growthRate.toFixed(1)}%
                                </>
                            ) : (
                                <>
                                    <TrendingDownIcon className="size-3" />
                                    {data.growthRate.toFixed(1)}%
                                </>
                            )}
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Compared to last month
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Active Accounts</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.activeOrganizations.toLocaleString()} </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Organizations active in the last 30 days
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Complete Organizations</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.completedProfiles.toLocaleString()} </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Organizations completed
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
