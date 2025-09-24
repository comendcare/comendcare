"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getOrganizationRFPsAnalytics, getRFPsAnalytics} from "~admin/lib/fetchers"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@comend/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface AnalyticsData {
    totalRFPs: number,
    totalPublishedRFPs: number,
    totalPrivateRFPs: number,
    RFPsByOpenTo: {type: string, num: number}[],
    RFPsByBudget: {type: string, num: number}[],
}

const researchPlansChartConfig = {
  num: {
    label: "Number of RFPs",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AdminRFPsAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        if (orgId) {
            getOrganizationRFPsAnalytics(orgId)
                .then((res) => {
                    console.log(`results`, res)
                    return res
                })
                .then(setData);
        } else {
            getRFPsAnalytics()
                .then((res) => {
                    console.log(`results`, res)
                    return res
                })
                .then(setData);
        }
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
                    <CardDescription>Total Published RFPs</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalPublishedRFPs.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Private RFPs</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalPrivateRFPs.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>{`Total RFPs by Open To (CROs or Academics)`}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={researchPlansChartConfig} 
                        style={{ width: '100%', height: 100 /* fixed height */ }}
                    > 
                    <BarChart
                        accessibilityLayer
                        data={data.RFPsByOpenTo}
                        layout="vertical"
                        margin={{left: 100}}
                    >
                        <XAxis 
                            type="number" 
                            dataKey="num" 
                        />
                        <YAxis
                            type="category"
                            dataKey="type"
                            width={undefined}
                            tick={({ x, y, payload }) => (
                                <foreignObject x={x - 120} y={y - 15} width={120} height={30}>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            width: '100%',
                                            height: '100%',
                                            textAlign: 'end',
                                            paddingRight: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                        }}
                                    >
                                        {payload.value}
                                    </div>
                                </foreignObject>
                            )}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="num" fill="var(--color-desktop)" radius={5} />
                    </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Total RFPs by Budget</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={researchPlansChartConfig} 
                        style={{ width: '100%', height: 800 /* fixed height */ }}
                    > 
                    <BarChart
                        accessibilityLayer
                        data={data.RFPsByBudget}
                        layout="vertical"
                        margin={{left: 100}}
                    >
                        <XAxis 
                            type="number" 
                            dataKey="num" 
                        />
                        <YAxis
                            type="category"
                            dataKey="type"
                            width={undefined}
                            tick={({ x, y, payload }) => (
                                <foreignObject x={x - 120} y={y - 15} width={120} height={30}>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            width: '100%',
                                            height: '100%',
                                            textAlign: 'end',
                                            paddingRight: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'end',
                                        }}
                                    >
                                        {payload.value}
                                    </div>
                                </foreignObject>
                            )}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="num" fill="var(--color-desktop)" radius={5} />
                    </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
