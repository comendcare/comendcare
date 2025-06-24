"use client";

import { useEffect, useState } from "react";
import { TrendingDownIcon, TrendingUp, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {getOrganizationAnalytics, getResearchPlansAnalytics} from "@/lib/fetchers";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface AnalyticsData {
    totalResearchPlans: number,
    totalResearchPlansOfType: {type: string, num: number}[],
    totalResearchPlansByStatus: {type: string, num: number}[],
    totalProjects: number,
    totalProjectsOfType: {type: string, num: number}[]
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

export function AdminResearchPlansAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        getResearchPlansAnalytics(orgId)
            .then((res) => {
                console.log(`results`, res)
                return res
            })
            .then(setData);
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-2 text-2xl font-semibold">Research Plans</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Research Plans</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalResearchPlans.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Total Research Plans by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={researchPlansChartConfig} 
                        style={{ width: '100%', height: 600 /* fixed height */ }}
                    > 
                    <BarChart
                        accessibilityLayer
                        data={data.totalResearchPlansOfType}
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
                    <CardTitle>Total Research Plans by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={researchPlansChartConfig} 
                        style={{ width: '100%', height: 300 /* fixed height */ }}
                    > 
                    <BarChart
                        accessibilityLayer
                        data={data.totalResearchPlansByStatus}
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

            <h1 className="col-span-2 text-2xl font-semibold">Projects</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Projects</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data?.totalProjects?.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Total Projects by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={projectsChartConfig}
                        style={{ width: '100%', height: 1000 /* fixed height */ }}
                    >
                    <BarChart
                        accessibilityLayer
                        data={data.totalProjectsOfType}
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
