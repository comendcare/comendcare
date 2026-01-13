"use client"

import * as React from "react"
import {TrendingUp, Workflow} from "lucide-react"
import {Label, Pie, PieChart} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@comend/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@comend/components/ui/chart"
import {OrganizationForAnalytics, StatusType} from "@comend/lib/types"
import {Button} from "@comend/components/ui/button";
import {ExternalLink} from "lucide-react"
import {useRouter} from "next/navigation";
import Image from "next/image"
import { NoResultsTemplate } from "@comend/components/no-results"


const STATUS_LABELS: Record<StatusType, string> = {
    PLANNED: "Planned",
    INPROGRESS: "In progress",
    COMPLETED: "Completed",
}

const STATUS_COLORS: Record<StatusType, string> = {
    PLANNED: "var(--chart-1)",
    INPROGRESS: "var(--chart-2)",
    COMPLETED: "var(--chart-3)",
}

const STATUS_COLORS_VAR_MAP: Record<StatusType, string> = {
    PLANNED: "--chart-1",
    INPROGRESS: "--chart-2",
    COMPLETED: "--chart-3",
}

export function DashboardProjectsStatusCard({organization}: { organization: OrganizationForAnalytics }) {
    const router = useRouter();

    // Derive counts + chart data directly from props (no effects/state)
    const {data, total} = React.useMemo(() => {
        const counts: Record<StatusType, number> = {
            PLANNED: 0,
            INPROGRESS: 0,
            COMPLETED: 0,
        }

        for (const m of organization.milestones ?? []) {
            const s = (m.status ?? "PLANNED") as StatusType
            counts[s] += 1
        }

        const orderedStatuses: StatusType[] = ["PLANNED", "INPROGRESS", "COMPLETED"]

        const chartData = (Object.entries(counts) as [StatusType, number][]).map(
            ([status, count]) => {
                const hslValue = getComputedStyle(document.documentElement)
                    .getPropertyValue(STATUS_COLORS_VAR_MAP[status])
                    .trim()

                return {
                    status,
                    count,
                    fill: `hsl(${hslValue})`,         // Used for <Pie />
                    colorPreview: `hsl(${hslValue})`, // Used for legend
                }
            }
        )

        const sum = orderedStatuses.reduce((acc, s) => acc + counts[s], 0)

        return {data: chartData, total: sum}
    }, [organization.milestones])

    const chartConfig: ChartConfig = {
        PLANNED: {label: STATUS_LABELS.PLANNED, color: STATUS_COLORS.PLANNED},
        INPROGRESS: {label: STATUS_LABELS.INPROGRESS, color: STATUS_COLORS.INPROGRESS},
        COMPLETED: {label: STATUS_LABELS.COMPLETED, color: STATUS_COLORS.COMPLETED},
    }

    if (organization.milestones.length === 0) return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader className="items-start pb-0">
                <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                    <Workflow className="h-5 w-5"/>
                    <h1 className="text-2xl font-normal">Project overview</h1>
                    <Button
                        onClick={() => router.push("/app/research-plan")}
                        variant="ghost"
                        size="icon"
                        className="p-0 h-auto w-auto"
                    >
                        <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </CardTitle>
                <div className="flex flex-row mb-4">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"
                        >
                            <div
                                style={{backgroundColor: item.colorPreview}}
                                className="flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0"
                            />
                            {STATUS_LABELS[item.status]}
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div
                    className="mx-auto max-h-[250px]"
                >
                    <NoResultsTemplate 
                        imgAlt="No projects"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        description={`Your organization doesn't have any projects yet.`}
                        imgSize={150}
                    />
                </div>
            </CardContent>
        </Card>
    )

    return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader className="items-start pb-0">
                <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                    <Workflow className="h-5 w-5"/>
                    <h1 className="text-2xl font-normal">Project overview</h1>
                    <Button
                        onClick={() => router.push("/app/research-plan")}
                        variant="ghost"
                        size="icon"
                        className="p-0 h-auto w-auto"
                    >
                        <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </CardTitle>
                <div className="flex flex-row mb-4">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"
                        >
                            <div
                                style={{backgroundColor: item.colorPreview}}
                                className="flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0"
                            />
                            {STATUS_LABELS[item.status]}
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel/>}
                        />
                        <Pie
                            data={data}
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
                                                    className="fill-foreground text-3xl font-semibold"
                                                >
                                                    {total.toLocaleString()}
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
    )
}
