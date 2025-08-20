"use client"

import { Database, Microscope, Activity } from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/packages/components/ui/card";
import { Prisma } from "@prisma/client";

type OrganizationWithIncludes = Prisma.OrganizationGetPayload<{
    include: {
        conditions: {
            include: {
                condition: true
            }
        },
        roadmaps: true;
        members: true;
        tools: true;
        biosamples: true;
        diseaseModel: true;
        rfps: true;
        materialAndDataAccessRequests: true;
    };
}>;

export default function PAGAnalyticsToolsCard({organization}: { organization: OrganizationWithIncludes }) {

    return (
        <Card className="col-span-4 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Tools
                </CardTitle>
                <CardDescription>Research tools and data resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Patient Biosamples</span>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.biosamples.length}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Disease Models</span>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.diseaseModel.length}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Clinical Datasets</span>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.tools.length}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Open Access Requests</span>
                        <div className="text-2xl font-bold">
                            {organization.materialAndDataAccessRequests.length}
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending approval</div>
                </div>
            </CardContent>
        </Card>
    );
}
