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
import { getClaimedOrganizationsAnalytics } from "~admin/lib/fetchers"

interface AnalyticsData {
    totalOrganizations: number,
    claimedOrganizations: number
}

const chartConfig = {
  claimed: {
    label: "Claimed Organizations",
  },
  unclaimed: {
    label: "Unclaimed Organizations",
  }
} satisfies ChartConfig

export function AdminOrganizationsClaimedChart() {
    const [data, setData] = React.useState<AnalyticsData | null>(null)

    React.useEffect(() => {
        // getOrganizationChartAnalytics().then(setChartData)
        getClaimedOrganizationsAnalytics()
            .then((res) => {
                console.log(`results`, res)
                return res
            })
            .then(setData);
    }, [])

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardTitle>Organizations Claimed</CardTitle>
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
                        data={[
                            {key: 'claimed', num: (data?.claimedOrganizations || 0), fill: "hsl(var(--chart-2))"},
                            {key: 'unclaimed', num: (data?.totalOrganizations || 0) - (data?.claimedOrganizations || 0), fill: "hsl(var(--chart-3))"}
                        ]}
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
                                        <>
                                        {data && (
                                            <tspan x={viewBox.cx} dy="0">
                                                {`${data.claimedOrganizations.toLocaleString()} of ${data.totalOrganizations.toLocaleString()} claimed`}
                                            </tspan>
                                        )}
                                        {data && (
                                            <tspan x={viewBox.cx} dy="1.2em">
                                                {`${((data.claimedOrganizations / data.totalOrganizations) * 100).toFixed(3)}% claimed`}
                                            </tspan>
                                        )}
                                        </>
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
