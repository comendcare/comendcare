"use client"

import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {PrivateBadge} from "~web/components/private-badge";
import {Calendar, Clock, DollarSign, FileText, School} from "lucide-react";
import {PropertyBadge} from "./property-badge";
import {checkDateRangeUTC, formatDateUTC, formatMoney} from "@comend/lib/utils";
import {RFPActionsMenu} from "./rfp-actions-menu";
import {Badge} from "@/packages/components/ui/badge";
import {Skeleton} from "@comend/components/ui/skeleton";
import { Separator } from "@/packages/components/ui/separator";
import { ProfilePhoto } from "@/packages/components/profile-photo";
import { Organization } from "@prisma/client";
import { PublicPrivateButton } from "./public-private-button";
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore";
import { useShallow } from "zustand/react/shallow";
import { revalidate } from "@/packages/lib/revalidate";

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

const rfpSelector = (state: RFPState) => ({
    updateRFP: state.updateRFP,
})

export const RFPCard = ({rfp, showOrganization = false, isPrivate = false}: { rfp: any; showOrganization?: boolean; isPrivate?: boolean }) => {
    // Gate the header (and actions menu) until after hydration
    const [mounted, setMounted] = useState(false);
    const { updateRFP } = useRFPStore(useShallow(rfpSelector))
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
                                {isPrivate && (
                                    <PublicPrivateButton 
                                        isPrivate={rfp.private}
                                        updateCallback={async (isPrivate: boolean) => {
                                            if (rfp.id) {
                                                await updateRFP(
                                                    {...rfp, private: isPrivate},
                                                    rfp.organizationId
                                                )
                                                await revalidate('/app/rfps')
                                            }
                                        }}
                                    />
                                )}
                                {rfp.title}
                            </CardTitle>
                            {status && (
                                <Badge variant={status.variant as any} className="text-sm">
                                    {status.label}
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
                                                return "Service providers";
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
                    <Badge className="font-normal w-fit" variant={"purple"}>
                        <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                        {rfp.milestones.length <= 1 ? `${rfp.milestones.length} Linked project` : `${rfp.milestones.length} Linked projects`}
                    </Badge>
                )}

                {showOrganization && rfp.organization && (
                    <>
                        <Separator />
                        <a
                            href={`http://${rfp.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name} className="h-9 w-9 -mt-1"/>
                                <p className="text-lg font-semibold underline">{rfp.organization.name}</p>
                            </div>
                        </a>
                    </>
                )}

            </CardContent>
        </Card>
    );
};
