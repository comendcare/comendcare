import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card";
import { Skeleton } from "@comend/components/ui/skeleton";
import { Workflow, ExternalLink, Microscope, Megaphone } from "lucide-react";
import { getSession } from "@comend/lib/auth";
import { Button } from "@comend/components/ui/button";
import Link from "next/link";
import type { OrganizationForAnalytics } from "@comend/lib/types";
import dynamic from "next/dynamic";

function DashboardProjectsStatusCardSkeleton() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardHeader>
            <CardContent className="pl-2 space-y-4">
                <Skeleton className="h-56 w-full" />
            </CardContent>
        </Card>
    );
}

function PAGAnalyticsToolsCardSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

function PAGAnalyticsLineChartCardSkeleton() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-64 w-full" />
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </CardContent>
        </Card>
    );
}

function PAGAnalyticsProfileCardSkeleton() {
    return (
        <Card className="col-span-3">
            <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

// --- Dynamic imports switched to Suspense ---
const DashboardProjectsStatusCard = dynamic(
    () => import("~web/components/dashboard-projects-status-card").then(m => m.DashboardProjectsStatusCard),
    { loading: () => <DashboardProjectsStatusCardSkeleton /> }
);

const PAGAnalyticsToolsCard = dynamic(
    () => import("~web/components/pag-analytics-tools-card").then((m) => m.default),
    { suspense: true }
);

const PAGAnalyticsLineChartCard = dynamic(
    () => import("~web/components/pag-analytics-line-chart-card").then((m) => m.default),
    { suspense: true }
);

const PAGAnalyticsProfileCard = dynamic(
    () => import("~web/components/pag-analytics-profile-card").then((m) => m.default),
    { suspense: true }
);

export default async function PAGDashboardAnalyticsTab({
                                                           organization,
                                                       }: {
    organization: OrganizationForAnalytics;
}) {
    const session = await getSession();

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-3xl font-semibold leading-6 text-gray-900">
                    {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]}` : `Hello`}
                </h2>
                <p className="pt-1 text-sm text-gray-700">{`Here's ${organization.name} at a glance.`}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Workflow className="h-5 w-5" />
                            <div className="text-2xl font-normal">
                                {"Research Plans"}
                            </div>
                            <Button asChild variant="ghost" size="icon" className="p-0 h-auto w-auto">
                                <Link href="/app/research-plan" aria-label="Research plans">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {organization.roadmaps.length > 0 ? (
                            <p className="text-xl font-semibold">{organization.roadmaps.length}</p>
                        ) : (
                            <div className="w-full flex justify-center pt-4">
                                <Link href={"/app/research-plan"}>
                                    <Button variant="cta">Create a research plan</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Microscope className="h-5 w-5" />
                            <div className="text-2xl font-normal">
                                {"Tools"}
                            </div>
                            <Button asChild variant="ghost" size="icon" className="p-0 h-auto w-auto">
                                <Link href="/app/tools/biosample" aria-label="Open tools">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {organization.tools.length > 0 ? (
                            <p className="text-xl font-semibold">{organization.tools.length}</p>
                        ) : (
                            <div className="w-full flex justify-center pt-4">
                                <Link href={"/app/tools/biosample"}>
                                    <Button variant="cta">Add pre-clinical tools</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Megaphone className="h-5 w-5 min-w-5" />
                            <div className="text-2xl font-normal">
                                {"RFPs"}
                            </div>
                            <Button asChild variant="ghost" size="icon" className="p-0 h-auto w-auto">
                                <Link href="/app/rfps" aria-label="Open RFPs">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {organization.rfps.length > 0 ? (
                            <p className="text-xl font-semibold">{organization.rfps.length}</p>
                        ) : (
                            <div className="w-full flex justify-center pt-4">
                                <Link href={"/app/rfps"}>
                                    <Button variant="cta">Create an RFP</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Suspense fallback={<DashboardProjectsStatusCardSkeleton />}>
                    <DashboardProjectsStatusCard organization={organization} />
                </Suspense>

                <Suspense fallback={<PAGAnalyticsToolsCardSkeleton />}>
                    <PAGAnalyticsToolsCard organization={organization} />
                </Suspense>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Suspense fallback={<PAGAnalyticsLineChartCardSkeleton />}>
                    <PAGAnalyticsLineChartCard organization={organization} />
                </Suspense>

                <Suspense fallback={<PAGAnalyticsProfileCardSkeleton />}>
                    <PAGAnalyticsProfileCard organization={organization} />
                </Suspense>
            </div>
        </div>
    );
}
