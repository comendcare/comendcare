"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@comend/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@comend/components/ui/chart"

const chartData = [
  { key: "claimed", num: 275, fill: "hsl(var(--chart-2))" },
  { key: "unclaimed", num: 200, fill: "hsl(var(--chart-3))" },
]

const chartConfig = {
  claimed: {
    label: "Claimed Genes",
  },
  unclaimed: {
    label: "Unclaimed Genes",
  }
} satisfies ChartConfig

export function AdminGenesClaimedChart() {
    // const [chartData, setChartData] = React.useState<{ date: string; organizations: number }[]>([])

    // React.useEffect(() => {
    //     getOrganizationChartAnalytics().then(setChartData)
    // }, [])

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardTitle>Genes Claimed</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="num"
                        nameKey="key"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                    <Label
                        content={({ viewBox }) => {
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
                                            className="fill-foreground text-md font-bold"
                                        >
                                            {`${((275 / 475)*100).toFixed(0)}% claimed`}
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
