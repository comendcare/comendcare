"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getToolsAnalytics} from "~admin/lib/fetchers"

interface AnalyticsData {
    totalTools: number,
}

export function AdminToolsAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getToolsAnalytics(orgId)
            .then((res) => {
                console.log(`results`, res)
                return res
            })
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-full text-2xl font-semibold">Tools</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Tools</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalTools.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}
