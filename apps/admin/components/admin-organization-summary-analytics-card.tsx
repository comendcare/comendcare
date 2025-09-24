"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getOrganizationAnalytics, getResearchPlansAnalytics} from "~admin/lib/fetchers"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comend/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface AnalyticsData {
    numPatientsEngaged: number;
}

const researchPlansChartConfig = {
  num: {
    label: "Number of research plans",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const projectsChartConfig = {
  num: {
    label: "Number of projects",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function OrganizationOverviewAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getOrganizationAnalytics(orgId)
            .then((res) => {
                console.log(`results`, res)
                return res
            })
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-2 text-2xl font-semibold">Organization Summary</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Patients Engaged</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data?.numPatientsEngaged.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Sum of patients engaged across this organization's conditions
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
