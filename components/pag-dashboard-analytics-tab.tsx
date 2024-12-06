import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import PAGAnalyticsBarChart from "@/components/pag-analytics-bar-chart";
import PAGAnalyticsLineChart from "@/components/pag-analytics-line-chart";
import {DonutChartCard} from "@/components/donut-chart-card";
import {Eye, Users, Workflow} from "lucide-react";
import {MagnifyingGlassIcon} from "@radix-ui/react-icons";
import prisma from "@/lib/prisma"
import {getSession} from "@/lib/auth";

export default async function PAGDashboardAnalyticsTab() {
    const session = await getSession()

    if (!session?.user.organizationId) {
        return <div>No session or organization ID found.</div>;
    }

    const organization = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
            roadmaps: true,
            members: true
        },
    });

    if (!organization) {
        return <div>No organization data available.</div>;
    }

    const milestones = organization.roadmaps[0]
        ? await prisma.milestone.findMany({
            where: { roadmapId: organization.roadmaps[0].id },
        })
        : []

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-xl font-semibold leading-6 text-gray-900">
                    Analytics
                </h2>
                <p className="text-sm text-gray-700">
                    Some stats and numbers around your organization.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Search Appearances
                        </CardTitle>
                        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+1223</div>
                        <p className="text-xs text-muted-foreground">
                            +19% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Profile views
                        </CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">
                            +201 since last hour
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Milestones
                        </CardTitle>
                        <Workflow className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{milestones.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +20.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Members
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{organization.members.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +180.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <PAGAnalyticsBarChart/>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Profile views</CardTitle>
                        <CardDescription>
                            <div className="text-2xl font-bold">
                                27
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +20% from last month
                            </p>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <PAGAnalyticsLineChart/>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <DonutChartCard/>
            </div>
        </div>
    )
}