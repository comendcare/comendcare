"use client"

import * as React from "react"
import {TrendingUp} from "lucide-react"
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
import {getMilestones} from "@/packages/lib/fetchers";
import {useEffect, useState} from "react"
import {StatusType} from "@comend/lib/types"
import {Organization, Prisma} from "@prisma/client";

const STATUS_LABELS: Record<StatusType, string> = {
    PLANNED: "Planned",
    INPROGRESS: "In Progress",
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

type OrganizationWithIncludes = Prisma.OrganizationGetPayload<{
    include: {
        conditions: {
            include: {
                condition: true
            }
        },
        roadmaps: true;
        members: true;
        tools: true;
        biosamples: true;
        diseaseModel: true;
        rfps: true;
        materialAndDataAccessRequests: true;
    };
}>;

export function DashboardProjectsStatusCard({organization}: { organization: OrganizationWithIncludes }) {
    const [data, setData] = useState<
        { status: StatusType; count: number; fill: string; colorPreview: string }[]
    >([])

    useEffect(() => {
        async function fetchData() {
            if (!organization?.id) return

            const result = await getMilestones(organization.id, {
                status: true,
            })

            if (result.success && result.data) {
                const counts: Record<StatusType, number> = {
                    PLANNED: 0,
                    INPROGRESS: 0,
                    COMPLETED: 0,
                }

                for (const m of result.data) {
                    const status = (m.status ?? "PLANNED") as StatusType
                    counts[status]++
                }

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

                setData(chartData)
            }
        }

        fetchData()
    }, [organization])

    const chartConfig: ChartConfig = {
        PLANNED: {label: STATUS_LABELS.PLANNED, color: STATUS_COLORS.PLANNED},
        INPROGRESS: {label: STATUS_LABELS.INPROGRESS, color: STATUS_COLORS.INPROGRESS},
        COMPLETED: {label: STATUS_LABELS.COMPLETED, color: STATUS_COLORS.COMPLETED},
    }

    return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader className="items-start pb-0">
                <CardTitle>Milestone status overview</CardTitle>
                <CardDescription>Current milestone distribution across all research plans.</CardDescription>
                <div className="flex flex-row mb-4">
                    {data.map((item, index) => (
                        <span
                            key={index}
                            className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"
                        >
      <span
          style={{ backgroundColor: item.colorPreview }}
          className="flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0"
      />
                            {STATUS_LABELS[item.status]}
    </span>
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
                                                    y={(viewBox.cy || 0) - 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Across
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {organization.roadmaps.length}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    research plans
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
