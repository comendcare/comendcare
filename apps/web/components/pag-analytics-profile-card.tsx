"use client"

import {Users, UserCircle, CircleDollarSign, Earth, ExternalLink} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/packages/components/ui/card";
import { Prisma } from "@prisma/client";
import {formatMoney, formatNumberWithCommas} from "@/packages/lib/utils";
import {Button} from "@comend/components/ui/button";
import {useRouter} from "next/navigation";

type OrganizationWithIncludes = Prisma.OrganizationGetPayload<{
    include: {
        conditions: { include: { condition: true } },
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
    const router = useRouter();

    return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Profile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">

                    {/* Members */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Members
                            </span>
                            <Button
                                onClick={() => router.push("/app/settings?tab=members")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.members.length}
                        </div>
                    </div>

                    {/* Patient population */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Earth className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Patients engaged
                            </span>
                            <Button
                                onClick={() => router.push("/app/profile")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.conditions?.[0].condition?.numberOfPatientsEngaged
                                ? formatNumberWithCommas(organization.conditions[0].condition.numberOfPatientsEngaged.toString())
                                : "--"}
                        </div>
                    </div>

                    {/* Research budget */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Research budget
                            </span>
                            <Button
                                onClick={() => router.push("/app/profile")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Button>
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
