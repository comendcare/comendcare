import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import PAGAnalyticsLineChartCard from "~web/components/pag-analytics-line-chart-card";
import {Workflow, ExternalLink, Microscope, Megaphone} from "lucide-react";
import {getSession} from "@comend/lib/auth";
import {DashboardProjectsStatusCard} from "~web/components/dashboard-projects-status-card";
import PAGAnalyticsToolsCard from "~web/components/pag-analytics-tools-card";
import PAGAnalyticsProfileCard from "~web/components/pag-analytics-profile-card";
import {Button} from "@comend/components/ui/button";
import Link from "next/link";
import {OrganizationForAnalytics} from "@comend/lib/types";

export default async function PAGDashboardAnalyticsTab({organization}: {organization: OrganizationForAnalytics}) {
    const session = await getSession()

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-3xl font-semibold leading-6 text-gray-900">
                    {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]}` : `Hello`}
                </h2>
                <p className="pt-1 text-sm text-gray-700">
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
                            <h1 className="text-2xl font-normal">{'Research Plans'}</h1>
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
                    </CardHeader>
                    <CardContent>
                        {organization.roadmaps.length > 0 
                            ? (<p className="text-xl font-semibold">{organization.roadmaps.length}</p>) 
                            : (
                                <div className="w-full flex justify-center pt-4">
                                <Link href={'/app/research-plan'}>
                                    <Button variant="cta">
                                        Create a research plan
                                    </Button>
                                </Link>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Microscope className="h-5 w-5"/>
                            <h1 className="text-2xl font-normal">{'Tools'}</h1>
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
                    </CardHeader>
                    <CardContent>
                        {organization.tools.length > 0 
                            ? (<p className="text-xl font-semibold">{organization.tools.length}</p>) 
                            : (
                                <div className="w-full flex justify-center pt-4">
                                <Link href={'/app/tools/biosample'}>
                                    <Button variant="cta">
                                        Add pre-clinical tools
                                    </Button>
                                </Link>
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2">
                            <Megaphone className="h-5 w-5 min-w-5"/>
                            <h1 className="text-2xl font-normal">{'RFPs'}</h1>
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
                    </CardHeader>
                    <CardContent>
                        {organization.rfps.length > 0 
                            ? (<p className="text-xl font-semibold">{organization.rfps.length}</p>) 
                            : (
                                <div className="w-full flex justify-center pt-4">
                                <Link href={'/app/rfps'}>
                                    <Button variant="cta">
                                        Create an RFP
                                    </Button>
                                </Link>
                                </div>
                            )
                        }
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
