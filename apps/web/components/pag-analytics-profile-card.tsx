"use client"

import { Database, Microscope, Users } from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/packages/components/ui/card";
import { Prisma } from "@prisma/client";
import {formatMoney, formatNumberWithCommas} from "@/packages/lib/utils";

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

export default function PAGAnalyticsProfileCard({organization}: { organization: OrganizationWithIncludes }) {

    return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Profile
                </CardTitle>
                <CardDescription>Profile information and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Members</span>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.members.length}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">Patient population</span>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.conditions?.[0].condition?.globalEstimatedPopulation ?
                                formatNumberWithCommas(organization.conditions?.[0].condition?.globalEstimatedPopulation.toString()) : "--"
                            }
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Research budget</span>
                        </div>
                        <div className="text-lg font-bold">
                            {`$${formatMoney(organization.researchBudget)}`}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
