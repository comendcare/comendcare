import {Users, UserCircle, CircleDollarSign, Earth, ExternalLink} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {formatMoney, formatNumberWithCommas} from "@comend/lib/utils";
import {Button, buttonVariants} from "@comend/components/ui/button";
import {OrganizationForAnalytics} from "@comend/lib/types";
import Link from "next/link";

export default function PAGAnalyticsProfileCard({organization}: { organization: OrganizationForAnalytics }) {

    return (
        <Card className="col-span-3 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Organization profile
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
                            <Link
                                href={"/app/team"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
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
                            <Link
                                href={"/app/profile"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {organization.conditions?.[0]?.condition?.numberOfPatientsEngaged
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
                            <Link
                                href={"/app/profile"}
                                className={buttonVariants({
                                    variant: "ghost",
                                    size: "icon",
                                    className: "p-0 h-auto w-auto",
                                })}
                            >
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                        <div className="text-lg font-semibold">
                            {`$${formatMoney(organization.researchBudget)}`}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
