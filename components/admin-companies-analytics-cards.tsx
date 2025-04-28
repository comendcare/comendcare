"use client";

import { useEffect, useState } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {getCompanyAnalytics} from "@/lib/fetchers";

interface AnalyticsData {
    totalCompanies: number;
    newCompaniesThisMonth: number;
    newCompaniesLastMonth: number;
    activeCompanies: number;
    growthRate: number;
}

export function AdminCompaniesAnalyticsCards() {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getCompanyAnalytics()
            .then((res) => res)
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    const growthPositive = data.growthRate >= 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Companies</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalCompanies.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Cumulative user accounts
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>New Companies This Month</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.newCompaniesThisMonth.toLocaleString()}
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
                        {data.activeCompanies.toLocaleString()} </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Companies active in the last 30 days
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
