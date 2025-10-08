"use client"

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card";
import { PrivateBadge } from "~web/components/private-badge";
import { Calendar, Clock, DollarSign, Megaphone, School, User } from "lucide-react";
import { PropertyBadge } from "./property-badge";
import { cn, formatMoney } from "@comend/lib/utils";
import { RFPActionsMenu } from "./rfp-actions-menu";
import { Badge } from "@/packages/components/ui/badge";
import { Skeleton } from "@comend/components/ui/skeleton";

type DateStatus =
    | { status: "Not Open"; daysRemaining: number | undefined; variant: "yellow" }
    | { status: "Open"; daysRemaining: number | undefined; variant: "green" }
    | { status: "Closed"; daysRemaining: number | undefined; variant: "red" }
    | undefined;

function toUTCDateOnly(d: Date) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function checkDateRangeUTC(startDateStr?: string | Date, endDateStr?: string | Date): DateStatus {
    if (!startDateStr && !endDateStr) return undefined;

    const todayUTC = toUTCDateOnly(new Date());
    const startRaw = startDateStr ? new Date(startDateStr) : undefined;
    const endRaw = endDateStr ? new Date(endDateStr) : undefined;

    if ((startRaw && isNaN(startRaw.getTime())) || (endRaw && isNaN(endRaw.getTime()))) return undefined;

    const start = startRaw ? toUTCDateOnly(startRaw) : undefined;
    const end = endRaw ? toUTCDateOnly(endRaw) : undefined;

    if (start && todayUTC < start) return { status: "Not Open", daysRemaining: undefined, variant: "yellow" };
    if (end && todayUTC > end) return { status: "Closed", daysRemaining: undefined, variant: "red" };

    if ((!start || todayUTC >= start) && (!end || todayUTC <= end)) {
        const daysRemaining = end ? Math.ceil((end.getTime() - todayUTC.getTime()) / 86400000) : 0;
        return { status: "Open", daysRemaining, variant: "green" };
    }
    return undefined;
}

const dateFmtUTC = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
});

function formatDateUTC(d?: string | Date) {
    if (!d) return "";
    const dd = new Date(d);
    if (isNaN(dd.getTime())) return "";
    return dateFmtUTC.format(dd);
}

/** Header skeleton that matches the header’s layout/height to prevent reflow */
function HeaderSkeleton() {
    return (
        <div className="gap-2 relative">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
            </div>
            <Skeleton className="mt-2 h-[3.5rem] w-3/4 rounded" />
        </div>
    );
}

export const RFPCard = ({ rfp, isPrivate = false }: { rfp: any; isPrivate?: boolean }) => {
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
                        <RFPActionsMenu rfp={rfp} />
                    </div>
                )}

                {/* Before hydration: render a stable skeleton to prevent any flash.
            After hydration: render the real header. */}
                {!mounted ? (
                    <HeaderSkeleton />
                ) : (
                    <>
            <span className="flex gap-2 items-center">
              <Megaphone className="w-6 min-w-6 h-6 min-h-6" />
              <CardTitle className="max-w-full truncate leading-normal">{rfp.title}</CardTitle>
                {rfp.private && <PrivateBadge iconOnly />}
                {status && (
                    <Badge variant={status.variant as any} className="text-sm">
                        {status.status}
                    </Badge>
                )}
            </span>

                        <CardDescription className="line-clamp-3 overflow-hidden min-h-[3.5rem]">
                            {rfp.description}
                        </CardDescription>
                    </>
                )}
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
                <ul className="w-full flex flex-wrap gap-4 text-sm text-wrap break-words">
                    {rfp.budget && (
                        <li>
                            <PropertyBadge icon={DollarSign}>
                                <p>{formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}

                    {Array.isArray(rfp.openTo) && rfp.openTo.length > 0 && (
                        <li>
                            <PropertyBadge icon={School}>
                                {`Open to: ${rfp.openTo
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
                                    .join(", ")}`}
                            </PropertyBadge>
                        </li>
                    )}

                    {rfp.startDate && (
                        <li>
                            <PropertyBadge icon={Calendar}>{`Opens: ${formatDateUTC(rfp.startDate)}`}</PropertyBadge>
                        </li>
                    )}

                    {rfp.endDate && (
                        <li>
                            <PropertyBadge icon={Calendar}>{`Due: ${formatDateUTC(rfp.endDate)}`}</PropertyBadge>
                        </li>
                    )}

                    {(rfp.contacts || []).map((contact: any, index: number) => (
                        <li key={index}>
                            <PropertyBadge icon={User}>
                                <p>{contact?.name || contact?.email || contact?.affiliation}</p>
                            </PropertyBadge>
                        </li>
                    ))}
                </ul>

                {status?.daysRemaining !== undefined && (
                    <Badge variant={"green"} className="w-full font-normal flex gap-2">
                        <Clock size={18} />
                        {`${status.daysRemaining} days remaining to submit proposals`}
                    </Badge>
                )}

                <span className="flex flex-row w-full gap-4">
          <Badge variant={"secondary"} className="flex justify-between w-full text-sm">
            <p className="font-normal">Organization: </p>
            <p>{rfp?.organization?.name}</p>
          </Badge>

          <Badge variant={"secondary"} className="flex justify-between w-full text-sm">
            <p className="font-normal">Primary Attachment: </p>
            <a
                className={cn(rfp?.attachments?.[0]?.link && "underline")}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                href={rfp?.attachments?.[0]?.link}
            >
              {rfp?.attachments?.[0]?.name || rfp?.attachments?.[0]?.link}
            </a>
          </Badge>

          <Badge variant={"secondary"} className="flex justify-between w-full text-sm">
            <p className="font-normal">Primary Contact: </p>
            <a
                className={cn(rfp?.contacts?.[0]?.email && "underline")}
                onClick={(e) => {
                    e.stopPropagation();
                }}
                href={rfp?.contacts?.[0]?.email ? `mailto:${rfp?.contacts[0]?.email}` : undefined}
            >
              {rfp?.contacts?.[0]?.name ||
                  rfp?.contacts?.[0]?.email ||
                  rfp?.contacts?.[0]?.affiliation}
            </a>
          </Badge>
        </span>
            </CardContent>
        </Card>
    );
};
