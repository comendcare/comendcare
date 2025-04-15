import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateBadge } from "@/components/private-badge";
import { DateView } from "@/components/miletone-date-view";
import { Calendar, Pin, User } from "lucide-react";
import { PropertyBadge } from "./property-badge";

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
                    {rfp.pinned && <Pin fill="current-color" className="absolute top-0 right-0 h-4 w-4 m-2"/>}
                </div>
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