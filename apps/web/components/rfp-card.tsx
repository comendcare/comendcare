"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comend/components/ui/card";
import { PrivateBadge } from "~web/components/private-badge";
import { DateView } from "~web/components/miletone-date-view";
import { Calendar, CircleDollarSign, Clock, DollarSign, Megaphone, Pin, School, User } from "lucide-react";
import { PropertyBadge } from "./property-badge";
import { cn, formatMoney } from "@comend/lib/utils";
import { RFPActionsMenu } from "./rfp-actions-menu";
import { Badge } from "@/packages/components/ui/badge";

export const RFPCard = ({rfp, isPrivate = false}: {rfp: any, isPrivate?: boolean}) => {
    type DateStatus =
        | { status: 'Not Open'; daysRemaining: number | undefined; variant: 'yellow' }
        | { status: 'Open'; daysRemaining: number | undefined; variant: 'green' }
        | { status: 'Closed'; daysRemaining: number | undefined; variant: 'red' }
        | undefined;

    function checkDateRange(startDateStr?: string, endDateStr?: string): DateStatus {
        // If both dates are undefined, return undefined
        if (!startDateStr && !endDateStr) return undefined;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        // Check for invalid dates
        if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
            return undefined;
        }

        // Normalize dates for day-level comparison
        const start = startDate
            ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
            : undefined;
        const end = endDate
            ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
            : undefined;

        // If before start date
        if (start && today < start) {
            return { status: 'Not Open', daysRemaining: undefined, variant: 'yellow' };
        }

        // If after end date
        if (end && today > end) {
            return { status: 'Closed', daysRemaining: undefined, variant: 'red' };
        }

        // If within range (start <= today <= end)
        if ((!start || today >= start) && (!end || today <= end)) {
            const daysRemaining = end
            ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
            return { status: 'Open', daysRemaining, variant: 'green' };
        }

        // Fallback
        return undefined;
    }

    const status = checkDateRange(rfp.startDate, rfp.endDate)

    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2 relative overflow-visible">
                {isPrivate && (
                    <div className="absolute top-1 right-1">
                        <RFPActionsMenu rfp={rfp}/>
                    </div>
                )}
                <span className="flex gap-2 items-center overflow-visible">
                    <Megaphone className="w-6 min-w-6 h-6 min-h-6"/>
                    <CardTitle className="max-w-full truncate overflow-visible">{rfp.title} </CardTitle>
                    {rfp.private && <PrivateBadge iconOnly/>}
                    {status && <Badge variant={status.variant} className="text-sm">{status.status}</Badge>}
                </span>
                <CardDescription className="line-clamp-3">{rfp.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ul className="w-full flex flex-wrap gap-4 text-sm text-wrap break-words">
                    {(rfp.budget) && (
                        <li>
                            <PropertyBadge icon={DollarSign}>
                                <p>{formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}
                    {(rfp.openTo && rfp.openTo.length > 0) && (
                        <li>
                            <PropertyBadge icon={School}>
                                {`Open to: ${rfp.openTo.map((option: string) => {
                                    switch (option) {
                                        case 'CRO': return 'Service Providers'
                                        case 'ACADEMIC': return 'Academics'
                                        default: return ''
                                    }
                                }).join(", ")}`}
                            </PropertyBadge>
                        </li>
                    )}
                    {(rfp.startDate) && (
                        <li>
                            <PropertyBadge icon={Calendar}>
                                {`Opens: ${rfp?.startDate?.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}`}
                            </PropertyBadge>
                        </li>
                    )}
                    {(rfp.endDate) && (
                        <li>
                            <PropertyBadge icon={Calendar}>
                                {`Due: ${rfp?.endDate?.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}`}
                            </PropertyBadge>
                        </li>
                    )}

                    {(rfp.contacts || []).map((contact: any, index: number) => {
                        return (
                            <li key={index}>
                                <PropertyBadge icon={User}>
                                    <p>{contact.name || contact.email || contact.affiliation}</p>
                                </PropertyBadge>
                            </li>
                        )
                    })}
                </ul>
                {status?.daysRemaining !== undefined && (
                    <Badge variant={"green"} className="w-full font-normal flex gap-2">
                        <Clock size={18}/>
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
                            className={cn(rfp?.attachments?.[0]?.link && 'underline')} 
                            onClick={(e) => {e.stopPropagation()}} 
                            href={rfp?.attachments?.[0]?.link}
                        >
                            {rfp?.attachments?.[0]?.name || rfp?.attachments?.[0]?.link}
                        </a>
                    </Badge>
                    <Badge variant={"secondary"} className="flex justify-between w-full text-sm">
                        <p className="font-normal">Primary Contact: </p>
                        <a 
                            className={cn(rfp?.contacts?.[0]?.email && 'underline')} 
                            onClick={(e) => {e.stopPropagation()}} 
                            href={rfp?.contacts?.[0]?.email ? `mailto:${rfp?.contacts[0]?.email}` : undefined}
                        >
                            {rfp?.contacts?.[0]?.name || rfp?.contacts?.[0]?.email || rfp?.contacts?.[0]?.affiliation}
                        </a>
                    </Badge>
                </span>
            </CardContent>
        </Card>
    )
}
