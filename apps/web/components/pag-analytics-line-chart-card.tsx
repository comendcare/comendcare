"use client"

import {useState, useEffect} from "react";
import {ResponsiveContainer, Line, LineChart, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/packages/components/ui/card";

type Point = { date: string; pageViews: number };

export default function PAGAnalyticsLineChartCard() {
    const [data, setData] = useState<Point[]>([]);
    const [total, setTotal] = useState(0);
    const [percentChange, setPercentChange] = useState<number | null>(null);

    useEffect(() => {
        const today = new Date(); // UTC dates
        const to = today.toISOString().slice(0, 10);
        const fromDate = new Date(today);
        fromDate.setUTCDate(today.getUTCDate() - 6); // last 7 days incl. today
        const from = fromDate.toISOString().slice(0, 10);

        // previous 7-day window
        const prevToDate = new Date(fromDate);
        prevToDate.setUTCDate(prevToDate.getUTCDate() - 1);
        const prevTo = prevToDate.toISOString().slice(0, 10);
        const prevFromDate = new Date(prevToDate);
        prevFromDate.setUTCDate(prevFromDate.getUTCDate() - 6);
        const prevFrom = prevFromDate.toISOString().slice(0, 10);

        (async () => {
            try {
                // current period
                const resCurrent = await fetch(`/api/mixpanel-pageviews?from=${from}&to=${to}`, {cache: "no-store"});
                const jsonCurrent = await resCurrent.json();
                const currentData = Array.isArray(jsonCurrent) ? jsonCurrent : [];

                // previous period
                const resPrev = await fetch(`/api/mixpanel-pageviews?from=${prevFrom}&to=${prevTo}`, {cache: "no-store"});
                const jsonPrev = await resPrev.json();
                const prevData = Array.isArray(jsonPrev) ? jsonPrev : [];

                setData(currentData);

                const currentTotal = currentData.reduce((sum, p) => sum + p.pageViews, 0);
                const prevTotal = prevData.reduce((sum, p) => sum + p.pageViews, 0);
                setTotal(currentTotal);

                if (prevTotal > 0) {
                    setPercentChange(((currentTotal - prevTotal) / prevTotal) * 100);
                } else {
                    setPercentChange(null);
                }
            } catch {
                setData([]);
                setTotal(0);
                setPercentChange(null);
            }
        })();
    }, []);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Profile views</CardTitle>
                <CardDescription>
                    <div className="text-2xl font-bold inline-flex items-baseline">
                        {total}
                        <div className="text-sm font-bold">
                            &nbsp;this week
                        </div>
                    </div>
                    {percentChange !== null && (
                        <p className={`text-xs ${percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {percentChange >= 0 ? "+" : ""}
                            {percentChange.toFixed(1)}% from last week
                        </p>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{top: 5, right: 10, left: 10, bottom: 5}}
                    >
                        <Tooltip/>
                        <Line
                            type="monotone"
                            strokeWidth={2}
                            dataKey="pageViews"
                            activeDot={{r: 6, style: {fill: "var(--theme-primary)", opacity: 0.25}}}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
