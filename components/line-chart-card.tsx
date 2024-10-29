'use client'
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts"
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";

const data = [
    {
        revenue: 10400,
        subscription: 240,
    },
    {
        revenue: 14405,
        subscription: 300,
    },
    {
        revenue: 9400,
        subscription: 200,
    },
    {
        revenue: 8200,
        subscription: 278,
    },
    {
        revenue: 7000,
        subscription: 189,
    },
    {
        revenue: 9600,
        subscription: 239,
    },
    {
        revenue: 11244,
        subscription: 278,
    },
    {
        revenue: 26475,
        subscription: 189,
    },
]

export const LineChartCard = () => {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Profile views
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    27
                </div>
                <p className="text-xs text-muted-foreground">
                    +20% from last month
                </p>
                <div className="h-[80px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <Line
                                type="monotone"
                                strokeWidth={2}
                                dataKey="revenue"
                                activeDot={{
                                    r: 6,
                                    style: { fill: "var(--theme-primary)", opacity: 0.25 },
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )};
