"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ResponsiveContainer, PieChart, Pie, Label} from "recharts";
import {cn} from "@/lib/utils";
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore";
import {useShallow} from "zustand/react/shallow";
import Image from "next/image"
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";

const statusLabels: Record<string, string> = {
    TODO: "To Do",
    INPROGRESS: "In Progress",
    DONE: "Done",
};

const selector = (state: RoadmapState) => ({
    milestones: state.milestones,
});

export const DonutChartCard = () => {
    const {milestones} = useRoadmapStore(useShallow(selector));

    // Group milestones by status and count them
    const milestoneStatusData = milestones.reduce<Record<string, number>>(
        (acc, milestone) => {
            acc[milestone.status] = (acc[milestone.status] || 0) + 1;
            return acc;
        },
        {}
    );

    // Define colors for known statuses
    const colors: Record<"TODO" | "INPROGRESS" | "DONE", string> = {
        TODO: "#9D82CA",
        INPROGRESS: "#CA9D82",
        DONE: "#82CA9D",
    };

    // Prepare data for the chart
    const chartData = Object.entries(milestoneStatusData).map(
        ([status, count]) => {
            const color = colors[status as keyof typeof colors] || "#CCCCCC"; // Use fallback color
            return {
                name: status,
                value: count,
                fill: color,
            };
        }
    )

    return (
        <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                    Milestones
                </CardTitle>
            </CardHeader>

            <CardContent>
                {chartData.length > 0 ?
                    <>
                        <div className="flex flex-row">
                            {chartData.map((data, index) => (
                                <span
                                    key={index}
                                    className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"
                                >
                                    <span
                                        style={{backgroundColor: data.fill}}
                                        className="flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0"
                                    />
                                    {statusLabels[data.name] || data.name}
                                </span>
                            ))}
                        </div>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        label
                                    >
                                        <Label
                                            className="font-semibold"
                                            value={`${chartData.reduce((acc, item) => acc + item.value, 0)} milestones`}
                                            position="center"
                                        />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                    : <div className="h-full flex flex-col items-center justify-center">
                        <Image
                            alt="Organization not verified"
                            src="https://illustrations.popsy.co/gray/surreal-flying-bulbs.svg"
                            width={300}
                            height={300}
                            className="dark:hidden"
                        />
                        <Image
                            alt="Organization not verified"
                            src="https://illustrations.popsy.co/white/surreal-flying-bulbs.svg"
                            width={300}
                            height={300}
                            className="hidden dark:block"
                        />
                        <div className="flex flex-col space-y-4">
                            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                                {`You don't have any roadmaps yet.`}
                            </p>
                            <Link
                                className={cn(buttonVariants({variant: "default"}))}
                                href={`/app/roadmap`}
                            >
                                Create roadmap
                            </Link>
                        </div>
                    </div>
                }
            </CardContent>
        </Card>
    );
};
