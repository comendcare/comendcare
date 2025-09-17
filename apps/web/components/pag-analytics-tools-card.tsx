"use client"

import {Database, Microscope, TestTubeDiagonal, Rat, ExternalLink, Info} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/packages/components/ui/card";
import {Prisma} from "@prisma/client";
import {Button} from "@comend/components/ui/button";
import {useRouter} from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@comend/components/ui/tooltip"
import {OrganizationForAnalytics} from "@/packages/lib/types";

export default function PAGAnalyticsToolsCard({organization}: { organization: OrganizationForAnalytics }) {
    const router = useRouter();

    return (
        <Card className="col-span-4 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Microscope className="h-5 w-5"/>
                    Toolkit overview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* Patient Biosamples */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <TestTubeDiagonal className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Patient biosamples
                            </span>
                            <Button
                                onClick={() => router.push("/app/tools/biosample")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.biosamples.length}
                        </div>
                    </div>

                    {/* Disease Models */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Rat className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Disease models
                            </span>
                            <Button
                                onClick={() => router.push("/app/tools/disease-models")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.diseaseModel.length}
                        </div>
                    </div>

                    {/* Clinical Datasets */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">
                                Clinical datasets
                            </span>
                            <Button
                                onClick={() => router.push("/app/tools/data")}
                                variant="ghost"
                                size="icon"
                                className="p-0 h-auto w-auto"
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        </div>
                        <div className="text-lg font-bold">
                            {organization.tools.length}
                        </div>
                    </div>
                </div>

                {/* Open Access Requests */}
                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="flex flex-row items-center justify-center gap-x-2 text-sm font-medium">
                            Open access requests
                            <TooltipProvider delayDuration={50}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="p-0 h-auto"
                                            variant="ghost"
                                        >
                                            <Info className="inline"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-64">
                                        <p>{`Requests that are pending approval across all tool types.`}</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Button
                                    onClick={() => router.push("/app/requests")}
                                    variant="ghost"
                                    size="icon"
                                    className="p-0 h-auto w-auto"
                                >
                                    <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                                </Button>
                            </TooltipProvider>
                        </span>
                        <div className="text-2xl font-bold">
                            {organization.materialAndDataAccessRequests.length}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
