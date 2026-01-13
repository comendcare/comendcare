import {Database, Microscope, TestTubeDiagonal, Rat, ExternalLink, Info} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@comend/components/ui/tooltip"
import {OrganizationForAnalytics} from "@comend/lib/types";
import Link from "next/link";

export default function PAGAnalyticsToolsCard({organization}: { organization: OrganizationForAnalytics }) {

    return (
        <Card className="col-span-4 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-normal">
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
                            <Link
                                href={"/app/tools/biosample"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
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
                            <Link
                                href={"/app/tools/disease-models"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
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
                            <Link
                                href={"/app/tools/data"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {organization.tools.length}
                        </div>
                    </div>
                </div>

                {/* Open Access Requests */}
                {/* <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="flex flex-row items-center justify-center gap-x-2 text-sm font-medium">
                            Open access requests
                            <TooltipProvider>
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
                                <Link
                                    href={"/app/requests"}
                                    className={buttonVariants({
                                        variant: "ghost",
                                        size: "icon",
                                        className: "p-0 h-auto w-auto",
                                    })}
                                >
                                    <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                                </Link>
                            </TooltipProvider>
                        </span>
                        <div className="text-2xl font-semibold">
                            {organization.materialAndDataAccessRequests.length}
                        </div>
                    </div>
                </div> */}
            </CardContent>
        </Card>
    );
}
