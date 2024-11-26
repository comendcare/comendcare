"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {FaPen} from "react-icons/fa6";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {Line, LineChart, ResponsiveContainer} from "recharts";
import {PrivateBadge} from "./private-badge";
import PAGAnalyticsLineChart from "@/components/pag-analytics-line-chart";

const viewsData = [
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

const searchData = [
    {
        revenue: 10400,
        subscription: 240,
    },
    {
        revenue: 11500,
        subscription: 255,
    },
    {
        revenue: 12800,
        subscription: 270,
    },
    {
        revenue: 14300,
        subscription: 285,
    },
    {
        revenue: 16000,
        subscription: 300,
    },
    {
        revenue: 18000,
        subscription: 320,
    },
    {
        revenue: 20500,
        subscription: 340,
    },
    {
        revenue: 23500,
        subscription: 360,
    },
]

export const PAGProfileAnalyticsCard = () => {

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Analytics
                </CardTitle>
                <PrivateBadge/>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        Profile views
                    </h3>
                    <div className="text-2xl font-bold">
                        27
                    </div>
                    <p className="text-xs text-muted-foreground">
                        +20% from last month
                    </p>
                    <div className="h-[80px]">
                        <PAGAnalyticsLineChart/>
                    </div>
                </div>
                <div>
                    <h3 className={cn("scroll-m-20 text-xl tracking-tight font-semibold")}>
                        {`Search appearances`}
                    </h3>
                    <div className="text-2xl font-bold">
                        8
                    </div>
                    <p className="text-xs text-muted-foreground">
                        +10% from last month
                    </p>
                    <div className="h-[80px]">
                        <PAGAnalyticsLineChart/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
