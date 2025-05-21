import {Metadata} from "next"
import {
    Database,
    Stethoscope,
    FlaskConical,
    FileSignature,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {PharmaProjectAnalyticsChart} from "@/components/pharma-project-analytics-chart"
import {PharmaProjectRecentRecommendations} from "@/components/pharma-project-recent-recommendations"

export const metadata: Metadata = {
    title: "Comend - Project",
    description: "Pharma project on Comend",
}

export default function PharmaProjectAnalyticsTab() {
    return (
        <div className="hidden flex-col md:flex">
            <div className="flex-1 space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Biosamples
                            </CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                764
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +20% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Patient datasets
                            </CardTitle>
                            <Stethoscope className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                23
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +8 from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pre-clinical studies
                            </CardTitle>
                            <FlaskConical className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                14
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +2 from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                IP
                            </CardTitle>
                            <FileSignature className="mr-1.5 h-4 w-4 flex-shrink-0"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                5
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +2 from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Completed PAG Projects</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <PharmaProjectAnalyticsChart/>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recently added PAGs</CardTitle>
                            <CardDescription>
                                6 patient groups were added to the platform this month
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PharmaProjectRecentRecommendations/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
