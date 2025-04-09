import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateBadge } from "@/components/private-badge";
import { DateView } from "@/components/miletone-date-view";
import { Calendar, User } from "lucide-react";
import { PropertyBadge } from "./property-badge";

export const RFPCard = ({rfp}: {rfp: any}) => {
    return (
        <Card className="h-full w-full text-left flex flex-col justify-between">
            <CardHeader className="gap-2">
                <div className="bg-blue-light h-32 -mt-6 -mx-6 rounded-t-md" />
                <CardTitle>{rfp.title} {rfp.private && <PrivateBadge iconOnly className="ml-auto pl-auto"/>}</CardTitle>
                <CardDescription className="line-clamp-3">{rfp.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
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