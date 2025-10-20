import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import PAGAnalyticsLineChartCard from "~web/components/pag-analytics-line-chart-card";
import {Workflow, ExternalLink, Microscope, Megaphone} from "lucide-react";
import {getSession} from "@/packages/lib/auth";
import {DashboardProjectsStatusCard} from "~web/components/dashboard-projects-status-card";
import PAGAnalyticsToolsCard from "~web/components/pag-analytics-tools-card";
import PAGAnalyticsProfileCard from "~web/components/pag-analytics-profile-card";
import {Button} from "@comend/components/ui/button";
import Link from "next/link";
import {OrganizationForAnalytics} from "@/packages/lib/types";

export default async function PAGDashboardAnalyticsTab({organization}: {organization: OrganizationForAnalytics}) {
    const session = await getSession()

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-2xl font-semibold leading-6 text-gray-900">
                    {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]}` : `Hello`}
                </h2>
                <p className="text-sm text-gray-700">
                    {`Here's ${organization.name} at a glance.`}
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {/*<Card>*/}
                {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
                {/*        <CardTitle className="text-sm font-medium">*/}
                {/*            Biosample tools*/}
                {/*        </CardTitle>*/}
                {/*        <Microscope className="h-4 w-4 text-muted-foreground"/>*/}
                {/*    </CardHeader>*/}
                {/*    <CardContent>*/}
                {/*        <div className="text-4xl font-semibold">*/}
                {/*            {organization.biosamples.length}*/}
                {/*        </div>*/}
                {/*        /!*<p className="text-xs text-muted-foreground">*!/*/}
                {/*        /!*    +19% from last month*!/*/}
                {/*        /!*</p>*!/*/}
                {/*    </CardContent>*/}
                {/*</Card>*/}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Workflow className="h-5 w-5"/>
                            Research plans
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <Link href="/app/research-plan" aria-label="Research plans">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                        {/* <Workflow className="h-4 w-4 text-muted-foreground"/> */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">{organization.roadmaps.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +20.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Microscope className="h-5 w-5"/>
                            Tools
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <Link href="/app/tools/biosample" aria-label="Open tools">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                        {/* <Microscope className="h-4 w-4 text-muted-foreground"/> */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">
                            {organization.tools.length + organization.biosamples.length + organization.diseaseModel.length}
                        </div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +201 since last hour*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Megaphone className="h-5 w-5"/>
                            RFPs
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <Link href="/app/rfps" aria-label="Open RFPs">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                            </Button>
                        </CardTitle>
                        {/* <Megaphone className="h-4 w-4 text-muted-foreground"/> */}
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">{organization.rfps.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +180.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/*<Card className="col-span-4">*/}
                {/*    <CardHeader>*/}
                {/*        <CardTitle>Overview</CardTitle>*/}
                {/*    </CardHeader>*/}
                {/*    <CardContent className="pl-2">*/}
                {/*        <PAGAnalyticsBarChart/>*/}
                {/*    </CardContent>*/}
                {/*</Card>*/}
                {/*<DonutChartCard organization={organization}/>*/}
                <DashboardProjectsStatusCard organization={organization}/>
                <PAGAnalyticsToolsCard organization={organization}/>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <PAGAnalyticsLineChartCard organization={organization}/>
                <PAGAnalyticsProfileCard organization={organization}/>
            </div>
        </div>
    )
}
