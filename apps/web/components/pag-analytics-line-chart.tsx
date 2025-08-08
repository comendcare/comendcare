"use client"

import {useState, useEffect} from "react";
import {ResponsiveContainer, Line, LineChart, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";

type Point = { date: string; pageViews: number };

export default function PAGAnalyticsLineChart() {
    const [data, setData] = useState<Point[]>([]);

    useEffect(() => {
        const today = new Date(); // UTC dates
        const to = today.toISOString().slice(0, 10);
        const fromDate = new Date(today);
        fromDate.setUTCDate(today.getUTCDate() - 6); // include today → 7 days total
        const from = fromDate.toISOString().slice(0, 10);

        (async () => {
            try {
                const res = await fetch(`/api/mixpanel-pageviews?from=${from}&to=${to}`, { cache: "no-store" });
                const json = await res.json();
                if (Array.isArray(json)) setData(json);
                else setData([]); // if {error:...}
            } catch {
                setData([]);
            }
        })();
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
                {/*<CartesianGrid strokeDasharray="3 3" />*/}
                {/*<XAxis dataKey="date" />*/}
                {/*<YAxis allowDecimals={false} />*/}
                <Tooltip />
                <Line
                    type="monotone"
                    strokeWidth={2}
                    dataKey="pageViews"
                    activeDot={{ r: 6, style: { fill: "var(--theme-primary)", opacity: 0.25 } }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
