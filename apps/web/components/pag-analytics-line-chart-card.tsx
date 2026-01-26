"use client"

import {useState, useEffect} from "react";
import {ResponsiveContainer, Line, LineChart, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Button} from "@comend/components/ui/button";
import {useRouter} from "next/navigation";
import {ExternalLink, UserCircle} from "lucide-react"
import Link from "next/link";
import {OrganizationForAnalytics} from "@comend/lib/types";

type Point = { date: string; pageViews: number };

function formatISODate(label: string) {
    const [y, m, d] = label.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}


export default function PAGAnalyticsLineChartCard({organization}: { organization: OrganizationForAnalytics }) {
    const router = useRouter();
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
        const orgHost = `${organization.subdomain}.comend.io`;

        (async () => {
            try {
                // current period
                const resCurrent = await fetch(
                    `/api/mixpanel-pageviews?from=${from}&to=${to}&host=${encodeURIComponent(orgHost)}`,
                    {cache: "no-store"}
                );
                const jsonCurrent = await resCurrent.json();
                const currentData = Array.isArray(jsonCurrent) ? jsonCurrent : [];

                // previous period
                const resPrev = await fetch(
                    `/api/mixpanel-pageviews?from=${prevFrom}&to=${prevTo}&host=${encodeURIComponent(orgHost)}`,
                    {cache: "no-store"}
                );
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
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle className="flex flex-row items-center justify-start gap-x-2 font-normal">
                    <UserCircle className="h-5 w-5"/>
                    Profile views

                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="p-0 h-auto w-auto"
                    >
                        <Link
                            href={`https://${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                        </Link>
                    </Button>
                </CardTitle>
                <div className="text-muted-foreground">
                    <div className="text-2xl font-semibold inline-flex items-baseline">
                        {total}
                        <span className="text-sm font-semibold">&nbsp;this week</span>
                    </div>
                    {percentChange !== null && (
                        <div
                            className={`text-xs ${percentChange >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                            {percentChange >= 0 ? "+" : ""}
                            {percentChange.toFixed(1)}% from last week
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{top: 5, right: 10, left: 10, bottom: 5}}
                    >
                        <Tooltip
                            formatter={(value: number) => [value.toLocaleString(), "Page Views"]}
                            labelFormatter={(_, payload) => {
                                const raw = payload?.[0]?.payload?.date as string | undefined;
                                if (!raw) return "";
                                // handle "YYYY-MM-DD" safely in UTC
                                const [y, m, d] = raw.slice(0, 10).split("-").map(Number);
                                const dt = new Date(Date.UTC(y, m - 1, d));
                                return dt.toLocaleDateString(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <Line
                            type="monotone"
                            strokeWidth={2}
                            dataKey="pageViews"
                            activeDot={{
                                r: 6,
                                style: {fill: "var(--theme-primary)", opacity: 0.25},
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
