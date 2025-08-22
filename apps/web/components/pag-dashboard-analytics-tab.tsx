import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import PAGAnalyticsBarChart from "~web/components/pag-analytics-bar-chart";
import PAGAnalyticsLineChartCard from "~web/components/pag-analytics-line-chart-card";
import {DonutChartCard} from "~web/components/donut-chart-card";
import {Workflow, ExternalLink, Database, FileCheck} from "lucide-react";
import prisma from "@comend/lib/prisma"
import {getSession} from "@/packages/lib/auth";
import Image from "next/image";
import CreateOrJoinOrganizationButton from "~web/components/create-or-join-organization-button";
import {DashboardProjectsStatusCard} from "~web/components/dashboard-projects-status-card";
import PAGAnalyticsToolsCard from "~web/components/pag-analytics-tools-card";
import PAGAnalyticsProfileCard from "~web/components/pag-analytics-profile-card";
import {Button} from "@comend/components/ui/button";
import Link from "next/link"; // ✅ server-safe navigation

export default async function PAGDashboardAnalyticsTab() {
    const session = await getSession()

    if (!session?.user.organizationId) {
        return <div className="h-full flex flex-col items-center justify-center py-20">
            <Image
                alt="No organization selected"
                src="https://illustrations.popsy.co/gray/keynote-presentation.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            <Image
                alt="No organization selected"
                src="https://illustrations.popsy.co/white/keynote-presentation.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                {`You're not part of an organization yet.`}
            </p>
            <div className="mt-8">
                <CreateOrJoinOrganizationButton/>
            </div>
        </div>
    }

    const organization = await prisma.organization.findUnique({
        where: {id: session.user.organizationId},
        include: {
            conditions: {
                include: {
                    condition: true
                }
            },
            roadmaps: true,
            members: true,
            tools: true,
            biosamples: true,
            diseaseModel: true,
            rfps: true,
            materialAndDataAccessRequests: true,
            savedCompanies: true
        },
    });

    if (!organization) {
        return <div>No organization data available.</div>;
    }

    return (
        <div className="p-4 space-y-4 w-full">
            <div className="space-y-2 sm:flex-auto">
                <h2 className="text-xl font-semibold leading-6 text-gray-900">
                    Hello, {session.user.name.split(" ")[0]}
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
                {/*        <div className="text-4xl font-bold">*/}
                {/*            {organization.biosamples.length}*/}
                {/*        </div>*/}
                {/*        /!*<p className="text-xs text-muted-foreground">*!/*/}
                {/*        /!*    +19% from last month*!/*/}
                {/*        /!*</p>*!/*/}
                {/*    </CardContent>*/}
                {/*</Card>*/}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2 text-base font-medium">
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
                        <Workflow className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{organization.roadmaps.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +20.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2 text-base font-medium">
                            Active RFPs
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
                        <FileCheck className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{organization.rfps.length}</div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +180.1% from last month*/}
                        {/*</p>*/}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex flex-row items-center justify-start gap-x-2 text-base font-medium">
                            Total tools
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
                        <Database className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {organization.tools.length}
                        </div>
                        {/*<p className="text-xs text-muted-foreground">*/}
                        {/*    +201 since last hour*/}
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
                <PAGAnalyticsLineChartCard organization={organization}/>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <PAGAnalyticsToolsCard organization={organization}/>
                <PAGAnalyticsProfileCard organization={organization}/>
            </div>
        </div>
    )
}
