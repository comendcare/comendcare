"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getOrganizationAnalytics} from "~admin/lib/fetchers"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comend/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DollarSign } from "lucide-react";

interface AnalyticsData {
    numPatientsEngaged: number;
    moneyRaised: number;
    moneyDeployed: number;
    researchBudget: number;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-full text-2xl font-semibold">Organization Summary</h1>
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

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Money Raised</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex flex-row items-center">
                        <DollarSign/>
                        {data?.moneyRaised.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Dollars raised, as specified on profile
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Money Deployed</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex flex-row items-center">
                        <DollarSign />
                        {data?.moneyDeployed.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Dollars deployed, as specified on profile
                    </div>
                </CardFooter>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Research Budget</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex flex-row items-center">
                        <DollarSign />
                        {data?.researchBudget.toLocaleString()}
                    </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="text-muted-foreground">
                        Research budget, as specified on profile
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
