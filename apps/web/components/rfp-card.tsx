"use client"

import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {PrivateBadge} from "~web/components/private-badge";
import {Calendar, Clock, DollarSign, School} from "lucide-react";
import {PropertyBadge} from "./property-badge";
import {checkDateRangeUTC, formatDateUTC, formatMoney} from "@comend/lib/utils";
import {RFPActionsMenu} from "./rfp-actions-menu";
import {Badge} from "@/packages/components/ui/badge";
import {Skeleton} from "@comend/components/ui/skeleton";

/** Header skeleton that matches the header’s layout/height to prevent reflow */
function HeaderSkeleton() {
    return (
        <div className="gap-2 relative">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded"/>
                <Skeleton className="h-6 w-48 rounded"/>
                <Skeleton className="h-5 w-16 rounded"/>
            </div>
            <Skeleton className="mt-2 w-3/4 rounded"/>
        </div>
    );
}

export const RFPCard = ({rfp, isPrivate = false}: { rfp: any; isPrivate?: boolean }) => {
    // Gate the header (and actions menu) until after hydration
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const status = useMemo(() => checkDateRangeUTC(rfp.startDate, rfp.endDate), [rfp.startDate, rfp.endDate]);

    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2 relative">
                {/* Actions menu only after mount to avoid portal jank */}
                {isPrivate && mounted && (
                    <div className="absolute top-1 right-1">
                        <RFPActionsMenu rfp={rfp}/>
                    </div>
                )}

                {/* Before hydration: render a stable skeleton to prevent any flash.
            After hydration: render the real header. */}
                {!mounted ? (
                    <HeaderSkeleton/>
                ) : (
                    <>
                        <div className="flex gap-2 items-center">
                            <CardTitle className="text-lg max-w-full truncate leading-normal">
                                {rfp.title}
                            </CardTitle>
                            {rfp.private && <PrivateBadge iconOnly/>}
                            {status && (
                                <Badge variant={status.variant as any} className="text-sm">
                                    {status.status}
                                </Badge>
                            )}
                        </div>

                        <CardDescription className="line-clamp-3 overflow-hidden">
                            {rfp.description}
                        </CardDescription>
                    </>
                )}
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <ul className="w-full flex flex-col flex-wrap gap-2 text-sm text-wrap break-words">
                    {rfp.budget && (
                        <li>
                            <PropertyBadge icon={DollarSign}>
                                <p><b>Budget: </b> ${formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {Array.isArray(rfp.openTo) && rfp.openTo.length > 0 && (
                        <li>
                            <PropertyBadge icon={School}>
                                <b>Open to:</b>
                                {rfp.openTo
                                    .map((option: string) => {
                                        switch (option) {
                                            case "CRO":
                                                return "Service Providers";
                                            case "ACADEMIC":
                                                return "Academics";
                                            default:
                                                return option;
                                        }
                                    })
                                    .join(", ")}
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.startDate && (
                        <li>
                            <PropertyBadge icon={Calendar}><b>Opens: </b>{formatDateUTC(rfp.startDate)}</PropertyBadge>
                        </li>
                    )}

                    {rfp.endDate && (
                        <li>
                            <PropertyBadge icon={Calendar}><b>Due: </b>{formatDateUTC(rfp.endDate)}</PropertyBadge>
                        </li>
                    )}
                </ul>

                {status?.daysRemaining !== undefined && (
                    <Badge variant={"green"} className="w-full font-normal flex gap-2">
                        <Clock size={18}/>
                        {`${status.daysRemaining} days remaining to submit proposals`}
                    </Badge>
                )}

                {(rfp.milestones && rfp.milestones.length > 0) && (
                    <div className="w-full flex gap-2 flex-wrap">
                        {rfp.milestones.map((project: any) => (
                            <Badge className="font-normal" variant={"purple"}>
                                {project.milestone.title}
                            </Badge>
                        ))}
                    </div>
                )}

            </CardContent>
        </Card>
    );
};
