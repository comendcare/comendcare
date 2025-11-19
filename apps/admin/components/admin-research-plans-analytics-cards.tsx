"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@comend/components/ui/card";
import {getOrganizationResearchPlansAnalytics, getResearchPlansAnalytics} from "~admin/lib/fetchers"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@comend/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DollarSign } from "lucide-react";
import { StatusType } from "@comend/lib/types";

interface AnalyticsData {
    totalResearchPlans: number,
    totalResearchPlansOfType: {type: string, num: number}[],
    totalResearchPlansByStatus: {type: string, num: number}[],
    totalProjects: number,
    totalProjectsOfType: {type: string, num: number}[],
    sumProjectBudgets: number,
    projectsByStauts: {type: string, num: number}[],
    projectStatusData: any,
    projectBudgetsByProgress: {type: string, num: number}[]
}

const STATUS_LABELS: Record<StatusType, string> = {
    PLANNED: "Planned",
    INPROGRESS: "In progress",
    COMPLETED: "Completed",
}

const STATUS_COLORS: Record<StatusType, string> = {
    PLANNED: "hsl(var(--chart-1))",
    INPROGRESS: "hsl(var(--chart-2))",
    COMPLETED: "hsl(var(--chart-3))",
}

const STATUS_COLORS_VAR_MAP: Record<StatusType, string> = {
    PLANNED: "hsl(var(--chart-1))",
    INPROGRESS: "hsl(var(--chart-2))",
    COMPLETED: "hsl(var(--chart-3))",
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

const projectStatusChartConfig: ChartConfig = {
    PLANNED: {label: STATUS_LABELS.PLANNED, color: STATUS_COLORS.PLANNED},
    INPROGRESS: {label: STATUS_LABELS.INPROGRESS, color: STATUS_COLORS.INPROGRESS},
    COMPLETED: {label: STATUS_LABELS.COMPLETED, color: STATUS_COLORS.COMPLETED},
}

const projectBudgetsChartConfig = {
  num: {
    label: "Budget across projects: $",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function AdminResearchPlansAnalyticsCards({orgId}: {orgId?: string | undefined}) {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        if (orgId) {
            getOrganizationResearchPlansAnalytics(orgId)
                .then((res) => {
                    return res
                })
                .then(setData);
        } else {
            getResearchPlansAnalytics()
                .then((res) => {
                    res.projectStatusData = (res.projectsByStatus as {type: StatusType, num: number}[]).map(
                        ({type, num}) => {
                            const hslValue = STATUS_COLORS_VAR_MAP[type]

                            return {
                                status: type,
                                count: num,
                                fill: hslValue,         // Used for <Pie />
                                colorPreview: hslValue, // Used for legend
                            }
                        }
                    )

                    return res
                })
                .then(setData);
        }
    }, []);

    if (!data) return null; // Or a skeleton

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
            <h1 className="col-span-full text-2xl font-semibold">Research Plans</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Research Plans</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data.totalResearchPlans.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card className="col-span-full">
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
            
            <Card className="col-span-full">
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

            <h1 className="col-span-full text-2xl font-semibold">Projects</h1>
            {/* <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Projects</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {data?.totalProjects?.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card> */}

            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardTitle>Total Projects by Status</CardTitle>
                </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={projectStatusChartConfig}
                    className="mx-auto aspect-square max-h-[400px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Pie
                            data={data.projectStatusData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({viewBox}) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {data.totalProjects.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    total projects
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            </Card>

            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>Total Projects by Modality</CardTitle>
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

            <h1 className="col-span-full text-2xl font-semibold">Project Budgets</h1>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Projects Budget</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex flex-row items-center">
                        <DollarSign />
                        {data?.sumProjectBudgets?.toLocaleString()}
                    </CardTitle>
                </CardHeader>
            </Card>
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle>GMV</CardTitle>
                    <CardDescription>Total value of project budgets, broken down by completed, in progress, and planning.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer 
                        config={projectBudgetsChartConfig}
                        style={{ width: '100%', height: 200 /* fixed height */ }}
                    >
                    <BarChart
                        accessibilityLayer
                        data={data.projectBudgetsByProgress}
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
