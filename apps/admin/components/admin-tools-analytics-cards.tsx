"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getOrganizationToolsAnalytics, getToolsAnalytics} from "~admin/lib/fetchers"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/packages/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

interface AnalyticsData {
    totalBiosamples: number;
    totalDiseaseModels: number;
    totalClinicalDatasets: number;
    totalBiosamplesOfType: {type: string, num: number}[];
    totalDiseaseModelsOfType: {type: string, num: number}[];
    totalClinicalDatasetsOfType: {type: string, num: number}[];
}

const toolsChartConfig = {
  num: {
    label: "Number of projects",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AdminToolsAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        if (orgId) {
            getOrganizationToolsAnalytics(orgId)
                .then((res) => {
                    console.log(`results`, res)
                    return res
                })
                .then(setData);
        } else {
            getToolsAnalytics()
                .then((res) => {
                    console.log(`results`, res)
                    return res
                })
                .then(setData);
        }
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-full text-2xl font-semibold">Toolkit Summary</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Tools</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalDiseaseModels + data.totalBiosamples + data.totalClinicalDatasets}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Biosamples</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalBiosamples.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Disease Models</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalDiseaseModels.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Clinical Datasets</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalClinicalDatasets.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Biosamples by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={toolsChartConfig}
                        style={{ width: '100%', height: 1000 /* fixed height */ }}
                    >
                    <BarChart
                        accessibilityLayer
                        data={data.totalBiosamplesOfType}
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

            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Disease Models by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={toolsChartConfig}
                        style={{ width: '100%', height: 600 /* fixed height */ }}
                    >
                    <BarChart
                        accessibilityLayer
                        data={data.totalDiseaseModelsOfType}
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

            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Clinical Datasets by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={toolsChartConfig}
                        style={{ width: '100%', height: 600 /* fixed height */ }}
                    >
                    <BarChart
                        accessibilityLayer
                        data={data.totalClinicalDatasetsOfType}
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
