"use client";

import {Skeleton} from "@comend/components/ui/skeleton";
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Button} from "@comend/components/ui/button";
import {useLoadingTimeout} from "~web/hooks/useLoadingTimeout";

export default function Loading() {
    useLoadingTimeout(5000);

    return (
        <div className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
            <div className="space-y-4 w-full">
                {/* Header / greeting */}
                <div className="space-y-2 sm:flex-auto">
                    <div className="h-6 w-40 sm:w-56">
                        <Skeleton className="h-6 w-full"/>
                    </div>
                    <div className="h-4 w-64 sm:w-80">
                        <Skeleton className="h-4 w-full"/>
                    </div>
                </div>

                {/* Top 3 metric cards: Research plans / Tools / RFPs */}
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Card key={`metric-${i}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle
                                    className="flex flex-row items-center justify-start gap-x-2 text-base font-medium">
                                    <Skeleton className="h-5 w-28"/>
                                    <Button variant="ghost" size="icon" className="p-0 h-auto w-auto" disabled>
                                        <Skeleton className="h-4 w-4 rounded"/>
                                    </Button>
                                </CardTitle>
                                <Skeleton className="h-4 w-4 rounded"/>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-16"/>
                                {/* <p className="text-xs text-muted-foreground">…</p> */}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Middle row: Projects status (left) + Tools breakdown (right) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* DashboardProjectsStatusCard placeholder (assume a chart + legend style) */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <Skeleton className="h-5 w-32"/>
                        </CardHeader>
                        <CardContent className="pl-2 space-y-4">
                            <Skeleton className="h-64 w-full"/>
                            <div className="grid grid-cols-3 gap-3">
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                                <Skeleton className="h-4 w-full"/>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PAGAnalyticsToolsCard placeholder (assume small stat grid) */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-5 w-28"/>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-col gap-3">
                                <Skeleton className="h-16 w-full"/>
                                <Skeleton className="h-16 w-full"/>
                                <Skeleton className="h-16 w-full"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom row: Line chart (left) + Profile card (right) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* PAGAnalyticsLineChartCard placeholder */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-5 w-32"/>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-64 w-full"/>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-20"/>
                                <Skeleton className="h-4 w-24"/>
                                <Skeleton className="h-4 w-16"/>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PAGAnalyticsProfileCard placeholder */}
                    <Card className="col-span-3">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full"/>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28"/>
                                    <Skeleton className="h-3 w-40"/>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-3/4"/>
                            <Skeleton className="h-4 w-2/3"/>
                            <Skeleton className="h-4 w-1/2"/>
                            <div className="grid grid-cols-2 gap-3">
                                <Skeleton className="h-14 w-full"/>
                                <Skeleton className="h-14 w-full"/>
                                <Skeleton className="h-14 w-full"/>
                                <Skeleton className="h-14 w-full"/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
