"use client"

import React, {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card";
import {Clock} from "lucide-react";
import {PropertyBadge} from "@comend/components/property-badge";
import {checkDateRangeUTC, DateStatus, formatDateUTC, formatMoney} from "@comend/lib/utils";
// import {RFPActionsMenu} from "./rfp-actions-menu";
import {Badge} from "@comend/components/ui/badge";
import {Skeleton} from "@comend/components/ui/skeleton";
import { Separator } from "@comend/components/ui/separator";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Organization } from "@prisma/client";
import { PublicPrivateButton } from "@comend/components/public-private-button";
import { RFPState, useRFPStore } from "@/state/rfp/rfpStore";
import { useShallow } from "zustand/react/shallow";
import { revalidate } from "@comend/lib/revalidate";
import ClaimedBadge from "comend-pag-platform/components/claimed-badge";

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

export const RFPStatusBadge = ({status}: {status: DateStatus}) => {
    return (
        <Badge variant={status?.variant || 'green'} className="w-full font-normal flex gap-2">
                <Clock size={18}/>
                <>
                    {(() => {
                        switch (status?.status) {
                            case 'OPEN':
                                return `${status?.daysRemaining} days remaining to submit proposals`
                            case 'ROLLING':
                                return `Open for proposals`
                            case 'COMINGSOON':
                                return (status?.daysRemaining === 1 
                                    ? `Opens in ${status?.daysRemaining} day` 
                                    : `Opens in ${status?.daysRemaining} days`)
                            case 'CLOSED':
                                return (status?.daysRemaining === 1
                                    ? `Closed ${status?.daysRemaining} day ago`
                                    : `Closed ${status?.daysRemaining} days ago`)
                            default:
                                return <></>
                        }
                    })()}
                </>
            </Badge>
    )
}

export const RFPCard = ({
    rfp, 
    showOrganization = false, 
    isPrivate = false,
    actionsMenu
}: { 
    rfp: any; 
    showOrganization?: boolean; 
    isPrivate?: boolean ;
    actionsMenu?: React.ReactNode | undefined
}) => {
    // Gate the header (and actions menu) until after hydration
    const [mounted, setMounted] = useState(false);
    const { updateRFP } = useRFPStore(useShallow(rfpSelector))
    useEffect(() => setMounted(true), []);

    const status = useMemo(() => checkDateRangeUTC(rfp.startDate, rfp.endDate), [rfp.startDate, rfp.endDate]);

    return (
        <Card className="h-full w-full text-left flex flex-col">
            <CardHeader className="gap-2 relative pb-2">
                {/* Actions menu only after mount to avoid portal jank */}
                {!!actionsMenu && mounted && (
                    <div className="absolute top-1 right-1">
                        {/* <RFPActionsMenu rfp={rfp}/> */}
                        {actionsMenu}
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
                        </div>
                    </>
                )}
            </CardHeader>

            <CardContent className="h-full flex flex-col gap-4">
                <RFPStatusBadge status={status} />

                <ul className="w-full flex flex-col flex-wrap gap-2 text-sm text-wrap break-words">
                        <li>
                            <PropertyBadge>
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

                        <li>
                            <PropertyBadge>
                                <p><b>Budget: </b>{rfp.budget ? `$${formatMoney(rfp.budget)}` : `Project based`}</p>
                            </PropertyBadge>
                        </li>
                </ul>

                <CardDescription className="line-clamp-3 overflow-hidden">
                    {rfp.description}
                </CardDescription>

                {showOrganization && rfp.organization && (
                    <>
                        <Separator className="mt-auto" />
                        <a
                            href={`http://${rfp.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name} className="h-9 w-9 -mt-1"/>
                                <p className="text-lg font-semibold underline">{rfp.organization.name}</p>
                                <ClaimedBadge
                                    organization={rfp.organization}
                                    mini={true}
                                />
                            </div>
                        </a>
                    </>
                )}

            </CardContent>
        </Card>
    );
};
