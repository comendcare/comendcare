"use client";

import { useEffect, useState } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyAndReviewAnalytics } from "@/lib/fetchers";

interface AnalyticsData {
    totalCompanies: number;
    newCompaniesThisMonth: number;
    newCompaniesLastMonth: number;
    companyGrowthRate: number;
    totalReviews: number;
    newReviewsThisMonth: number;
}

export function AdminCompaniesAnalyticsCards() {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getCompanyAndReviewAnalytics()
            .then((res) => res)
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    const growthPositive = data.companyGrowthRate >= 0;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            {/* Total Companies */}
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Companies</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalCompanies.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Cumulative company accounts
                    </div>
                </CardFooter>
            </Card>

            {/* New Companies This Month */}
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
                                    +{data.companyGrowthRate.toFixed(1)}%
                                </>
                            ) : (
                                <>
                                    <TrendingDownIcon className="size-3" />
                                    {data.companyGrowthRate.toFixed(1)}%
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

            {/* Total Reviews */}
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Reviews</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalReviews.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Cumulative reviews across companies
                    </div>
                </CardFooter>
            </Card>

            {/* New Reviews This Month */}
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>New Reviews This Month</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.newReviewsThisMonth.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Reviews created this month
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
