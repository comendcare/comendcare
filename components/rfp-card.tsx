import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateBadge } from "@/components/private-badge";
import { DateView } from "@/components/miletone-date-view";
import { Calendar, CircleDollarSign, DollarSign, Pin, User } from "lucide-react";
import { PropertyBadge } from "./property-badge";
import { formatMoney } from "@/lib/utils";
import { RFPActionsMenu } from "./rfp-actions-menu";

export const RFPCard = ({rfp}: {rfp: any}) => {
    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2">
                <div className="relative bg-blue-light h-[40px] -mt-6 -mx-6 rounded-t-md overflow-hidden">
                    {rfp.headerImage && (
                        <img
                            src={rfp.headerImage}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center"
                            }}
                        />
                    )}
                    <div className="absolute top-1 right-1">
                        <RFPActionsMenu rfp={rfp}/>
                    </div>
                </div>
                <CardTitle className="flex gap-2 items-center">
                    {rfp.title} 
                    {rfp.private && <PrivateBadge iconOnly className="ml-auto pl-auto"/>}
                    {rfp.pinned && <Pin fill="current-color" className="ml-auto pl-auto min-h-4 h-4 min-w-4 w-4"/>}
                </CardTitle>
                <CardDescription className="line-clamp-3">{rfp.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {(rfp.budget) && (
                        <li>
                            <PropertyBadge icon={DollarSign}>
                                <p>{formatMoney(rfp.budget)}</p>
                            </PropertyBadge>
                        </li>
                    )}
                    {(rfp.startDate || rfp.endDate) && (
                        <li>
                            <PropertyBadge icon={Calendar}>
                                <DateView 
                                    specific={true} 
                                    startDate={rfp.startDate || undefined} 
                                    endDate={rfp.endDate || undefined} 
                                    startLabel="Request Opens:" 
                                    endLabel="Deadline for Proposals:"
                                />
                            </PropertyBadge>
                        </li>
                    )}

                    {(rfp.contacts || []).map((contact: any, index: number) => {
                        return (
                            <li key={index}>
                                <PropertyBadge icon={User}>
                                    <p className="w-[90%] text-wrap break-words">
                                        {[contact.name, contact.email, contact.affiliation].filter(x => x).join(` \u2022 `)}
                                    </p>
                                </PropertyBadge>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>
    )
}