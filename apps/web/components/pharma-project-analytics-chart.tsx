"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

function generateRealisticGrowthData() {
    const data = []
    let currentTotal = 45
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    for (const month of months) {
        const growthRate = 1 + (Math.random() * 0.23 + 0.02)
        currentTotal = Math.round(currentTotal * growthRate)
        data.push({
            name: month,
            total: currentTotal,
        })
    }

    return data
}

const data = generateRealisticGrowthData()

export function PharmaProjectAnalyticsChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Bar
                    dataKey="total"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
