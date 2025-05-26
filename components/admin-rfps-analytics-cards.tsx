"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {getRFPsAnalytics} from "@/lib/fetchers";

interface AnalyticsData {
    totalRFPs: number,
    totalPinnedRFPs: number,
}

export function AdminRFPsAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getRFPsAnalytics(orgId)
            .then((res) => {
                console.log(`results`, res)
                return res
            })
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-2 text-2xl font-semibold">RFPs</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total RFPs</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalRFPs.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Pinned RFPs</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalPinnedRFPs.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}
